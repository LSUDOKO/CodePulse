'use strict';

/**
 * CodePulse - Pro AI Handler (Gemini Streaming)
 * Version 2.0 - High-performance streaming review
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { PERSONAS } = require('./personas');

let genAI = null;
let groq = null;

function getGeminiClient() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is missing');
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

function getGroqClient() {
    if (!groq) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error('GROQ_API_KEY is missing');
        groq = new Groq({ apiKey });
    }
    return groq;
}

/**
 * Advanced Streaming Review (Supports Groq & Gemini)
 */
async function reviewCodeStream(code, personaKey, strictness, onChunk) {
    const provider = process.env.AI_PROVIDER || 'gemini';
    const persona = PERSONAS[personaKey];
    if (!persona) throw new Error(`Invalid persona: ${personaKey}`);
    const systemPrompt = persona.getSystemPrompt(strictness);

    if (provider === 'groq') {
        return await streamGroq(code, systemPrompt, onChunk);
    } else {
        return await streamGemini(code, systemPrompt, onChunk);
    }
}

async function streamGroq(code, systemPrompt, onChunk) {
    const client = getGroqClient();
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    console.log(`[aiHandler] Requesting Groq (${model})...`);

    const stream = await client.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Code for review:\n\n\`\`\`\n${code}\n\`\`\`` }
        ],
        model: model,
        stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullText += content;
        if (onChunk && content) onChunk(content);
    }
    return fullText;
}

async function streamGemini(code, systemPrompt, onChunk) {
    const client = getGeminiClient();
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const fallbackModel = 'gemini-1.5-flash-latest';

    async function attemptGemini(modelName) {
        console.log(`[aiHandler] Requesting Gemini (${modelName})...`);
        const model = client.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });
        const result = await model.generateContentStream(`Code for review:\n\n\`\`\`\n${code}\n\`\`\``);
        let text = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            text += chunkText;
            if (onChunk) onChunk(chunkText);
        }
        return text;
    }

    try {
        return await attemptGemini(primaryModel);
    } catch (error) {
        if (error.status === 429 && primaryModel !== fallbackModel) {
            console.warn(`[aiHandler] Gemini quota hit, trying fallback...`);
            return await attemptGemini(fallbackModel);
        }
        throw error;
    }
}

/** Legacy non-streaming support */
async function reviewCode(code, personaKey, strictness) {
    let fullText = "";
    await reviewCodeStream(code, personaKey, strictness, (chunk) => { fullText += chunk; });
    return fullText;
}

module.exports = { reviewCodeStream, reviewCode };
