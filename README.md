# CodePulse ⚡ — Physical Code Review Console

> **Logitech DevStudio 2026 Hackathon** · Category: MX Creative Console + MX Master 4

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue)](https://ai.google.dev/)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-007ACC)](https://code.visualstudio.com/)

---

## What is CodePulse?

CodePulse transforms the **Logitech MX Creative Console** into a developer's physical code review station, integrated directly into VS Code. Each of the **9 LCD keys** triggers a different AI-powered review action — security scanning, performance analysis, test generation, PR summaries, and more. **No typing. No tab switching. No losing your flow.**

---

## 🎮 Hardware Mapping

| Hardware | Action |
|----------|--------|
| **9 LCD Keys** | 9 AI review personas (Security, Perf, Tests, etc.) |
| **MX Dial** | Review strictness: Junior → Mid → Senior → Principal |
| **Actions Ring (MX Master 4)** | Scroll through previous review outputs |

---

## 🤖 The 9 Review Personas

| Key | Persona | What it does |
|-----|---------|-------------|
| 🔒 | **Security Scan** | OWASP vulnerability analysis, injection risks, auth issues |
| ⚡ | **Performance** | Big-O, memory leaks, N+1 queries, rendering bottlenecks |
| 📝 | **Auto Docs** | Generate JSDoc / Python docstrings automatically |
| 🧪 | **Write Tests** | Jest or pytest unit tests with edge cases |
| 🔧 | **Refactor** | SOLID principles, clean code, design patterns |
| 💡 | **Explain** | Plain-English code explanation for review comments |
| 🐛 | **Find Bugs** | Logic errors, null risks, race conditions |
| ✅ | **PR Summary** | GitHub PR description with What/Why/How/Testing |
| 💬 | **Review Comment** | Professional inline code review comment |

---

## 🎚️ Strictness Levels (controlled by MX Dial)

| Level | Label | Style |
|-------|-------|-------|
| 1 | Junior Dev | Friendly, educational, encouraging |
| 2 | Mid-level Dev | Clear, practical, production-focused |
| 3 | Senior Dev | Thorough, references OWASP/SOLID, no hand-holding |
| 4 | Principal Engineer | Brutal precision, CVE patterns, architecture-level |

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)

### 1. Clone & Configure

```bash
git clone https://github.com/yourname/codepulse
cd codepulse
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 2. Start the Bridge Server

```bash
cd bridge
npm install
npm start
# Server runs at http://localhost:3000
```

### 3. Open the Demo UI

```bash
# Linux/Mac
./start.sh

# Windows
start.bat

# Or open directly
open demo-ui/index.html
```

### 4. Install VS Code Extension (optional)

```bash
cd vscode-extension
npm install
npm run compile
# In VS Code: Ctrl+Shift+P → "Developer: Install Extension from Location"
# Select the vscode-extension/ folder
```

---

## 📁 Project Structure

```
codepulse/
├── bridge/
│   ├── server.js        ← Express server (port 3000)
│   ├── aiHandler.js     ← Google Gemini API calls
│   ├── personas.js      ← 9 review personas × 4 strictness levels
│   └── state.js         ← App state management
├── vscode-extension/
│   ├── src/
│   │   └── extension.ts ← VS Code extension (WebView panel + polling)
│   └── package.json
├── logitech-plugin/
│   └── manifest.json    ← Logitech Actions SDK plugin definition
├── demo-ui/
│   └── index.html       ← 🎯 Beautiful MX Console simulator for video demo
├── start.sh             ← Linux/Mac startup script
├── start.bat            ← Windows startup script
└── .env.example         ← Environment variables template
```

---

## 🔌 API Reference (Bridge Server)

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/health` | GET | — | Health check |
| `/status` | GET | — | Full app state + persona metadata |
| `/action` | POST | `{ persona, code? }` | Trigger AI review (main endpoint) |
| `/set-strictness` | POST | `{ level: 1-4 }` | Change strictness level (dial) |
| `/scroll-output` | POST | `{ direction: "next"\|"prev" }` | Scroll outputs (Actions Ring) |
| `/simulate-key/:persona` | POST | `{ code? }` | Simulate button press (demo/testing) |
| `/set-code` | POST | `{ code }` | Pre-load code for review |

---

## 🎬 Demo Video

> [📺 Watch the 60-second demo](https://youtu.be/YOUR_DEMO_LINK)

---

## 🏆 Hackathon Submission

**Event:** Logitech DevStudio 2026  
**Category:** MX Creative Console + MX Master 4  
**Deadline:** February 25th, 9:30 PM IST  

**Tech Stack:**
- Logitech Actions SDK
- Google Gemini 2.0 Flash API  
- Node.js + Express (bridge server)
- TypeScript (VS Code extension)
- Vanilla HTML/CSS/JS (demo UI)

---

## 📃 License

MIT © 2026 CodePulse Team
