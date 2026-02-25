'use strict';

/**
 * CodePulse - Pro Bridge Server v2.0
 * Real-time hardware integration with Socket.io streaming
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { reviewCodeStream } = require('./aiHandler');
const { PERSONAS } = require('./personas');
const state = require('./state');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the demo UI folder
app.use(express.static(path.join(__dirname, '../demo-ui')));

// ─── Socket.io Logic ───────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Send initial state WITH personas so UI can render LCD keys
    socket.emit('stateUpdate', { ...state.getState(), personas: PERSONAS });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

/**
 * Broadcast state to all clients
 */
function broadcastState() {
    io.emit('stateUpdate', { ...state.getState(), personas: PERSONAS });
}

// ─── REST Endpoints ───────────────────────────────────────────

app.get('/status', (req, res) => {
    res.json({
        ...state.getState(),
        personas: PERSONAS // Export persona metadata
    });
});

/**
 * Main Action Gateway
 * Triggered by Logitech LCD Keys
 */
app.post('/action', async (req, res) => {
    const { persona, code } = req.body;
    const current = state.getState();
    const codeToReview = code || current.lastCode;

    if (!persona || !PERSONAS[persona]) {
        return res.status(400).json({ error: 'Invalid persona' });
    }

    if (!codeToReview) {
        return res.status(400).json({ error: 'No code to review' });
    }

    // Update state immediately
    state.setState({
        activePersona: persona,
        lastCode: codeToReview,
        isStreaming: true,
        currentStream: ""
    });
    broadcastState();

    res.json({ success: true, message: "Review started" });

    try {
        let fullResult = "";
        await reviewCodeStream(
            codeToReview,
            persona,
            current.strictness,
            (chunk) => {
                fullResult += chunk;
                state.setState({ currentStream: fullResult });
                io.emit('streamChunk', { chunk, full: fullResult });
            }
        );

        // Finalize
        state.addToHistory({
            persona,
            code: codeToReview,
            result: fullResult,
            strictness: current.strictness,
            personaName: PERSONAS[persona].name,
            personaIcon: PERSONAS[persona].icon,
            personaColor: PERSONAS[persona].color
        });

        state.setState({ isStreaming: false });
        broadcastState();
        io.emit('streamEnd', { result: fullResult });

    } catch (error) {
        console.error('[Action Error]', error);
        state.setState({ isStreaming: false });
        io.emit('streamError', { error: error.message });
        broadcastState();
    }
});

/**
 * DIAL - Strictness Control
 */
app.post('/set-strictness', (req, res) => {
    let { level } = req.body;
    level = parseInt(level);
    if (level >= 1 && level <= 4) {
        state.setState({ strictness: level });
        broadcastState();
        res.json({ success: true, level });
    } else {
        res.status(400).json({ error: 'Invalid level' });
    }
});

/**
 * ACTIONS RING - History Navigation
 */
app.post('/scroll-output', (req, res) => {
    const { direction } = req.body;
    const current = state.getState();
    if (current.history.length === 0) return res.json({ success: false });

    let currentIndex = current.history.findIndex(h => h.id === current.selectedHistoryId);
    if (currentIndex === -1) currentIndex = 0;

    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % current.history.length;
    } else {
        currentIndex = (currentIndex - 1 + current.history.length) % current.history.length;
    }

    const selected = current.history[currentIndex];
    state.setState({ selectedHistoryId: selected.id });
    broadcastState();

    io.emit('historySelect', selected);
    res.json({ success: true, selected });
});

// Start the real-time server
server.listen(PORT, () => {
    console.log(`
  CodePulse Pro Bridge v2.0
  -------------------------
  🚀 Server: http://localhost:${PORT}
  📡 Real-time: Enabled (Socket.io)
  -------------------------
  `);
});
