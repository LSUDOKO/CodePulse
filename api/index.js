'use strict';

const express = require('express');
const cors = require('cors');
const { reviewCodeStream } = require('../bridge/aiHandler');
const { PERSONAS } = require('../bridge/personas');
const state = require('../bridge/state');

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/status - Match bridge server behavior
app.get('/api/status', (req, res) => {
    res.json({
        ...state.getState(),
        personas: PERSONAS
    });
});

// POST /api/set-strictness
app.post('/api/set-strictness', (req, res) => {
    let { level } = req.body;
    level = parseInt(level);
    if (level >= 1 && level <= 4) {
        state.setState({ strictness: level });
        res.json({ success: true, level });
    } else {
        res.status(400).json({ error: 'Invalid level' });
    }
});

// POST /api/action - Vercel-friendly streaming version
app.post('/api/action', async (req, res) => {
    const { persona, code } = req.body;
    const current = state.getState();
    const codeToReview = code || current.lastCode;

    if (!persona || !PERSONAS[persona]) {
        return res.status(400).json({ error: 'Invalid persona' });
    }
    if (!codeToReview) {
        return res.status(400).json({ error: 'No code to review' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        let fullResult = "";
        await reviewCodeStream(
            codeToReview,
            persona,
            current.strictness,
            (chunk) => {
                fullResult += chunk;
                // SSE format: data: <json>\n\n
                res.write(`data: ${JSON.stringify({ chunk, full: fullResult })}\n\n`);
            }
        );

        // Final event
        res.write(`data: ${JSON.stringify({ done: true, result: fullResult })}\n\n`);
        res.end();

    } catch (error) {
        console.error('[Vercel Action Error]', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

module.exports = app;
