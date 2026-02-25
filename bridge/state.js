/**
 * CodePulse - Advanced State Management
 * Version 2.0 - Supporting real-time streams and session history
 */

'use strict';

let state = {
    strictness: 2,        // 1=Junior 2=Mid 3=Senior 4=Principal
    activePersona: null,  // last button pressed
    lastCode: "",         // last code snippet reviewed
    isStreaming: false,   // current streaming status
    history: [],          // full session history {id, persona, result, timestamp, strictness, code}
    currentStream: "",    // buffer for active AI stream
    selectedHistoryId: null // for Actions Ring navigation
};

const STRICTNESS_LABELS = {
    1: "Junior Dev",
    2: "Mid-level Dev",
    3: "Senior Dev",
    4: "Principal Engineer"
};

function getState() {
    return JSON.parse(JSON.stringify(state)); // Deep copy to avoid mutation
}

function setState(patch) {
    state = { ...state, ...patch };
}

function addToHistory(item) {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const entry = {
        id,
        timestamp: Date.now(),
        ...item
    };
    state.history.unshift(entry);

    // Keep last 10 items for professional session management
    if (state.history.length > 10) {
        state.history.pop();
    }

    state.selectedHistoryId = id;
    return id;
}

function getStrictnessLabel(level) {
    return STRICTNESS_LABELS[level] || STRICTNESS_LABELS[2];
}

module.exports = {
    getState,
    setState,
    addToHistory,
    getStrictnessLabel,
    STRICTNESS_LABELS
};
