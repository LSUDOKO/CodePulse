#!/bin/bash

# ╔══════════════════════════════════════════════════════╗
# ║         CodePulse — Startup Script (Linux/Mac)       ║
# ╚══════════════════════════════════════════════════════╝

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "  ⚡ Starting CodePulse..."
echo ""

# Check for .env
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "  ⚠️  Created .env from .env.example"
    echo "  👉 IMPORTANT: Add your GEMINI_API_KEY to .env before using AI features"
    echo ""
  fi
fi

# Install bridge dependencies
echo "  📦 Installing bridge dependencies..."
cd bridge
npm install --silent
cd ..

echo "  ✅ Dependencies installed"
echo ""

# Start bridge server in background
echo "  🚀 Starting bridge server on port 3000..."
cd bridge
node server.js &
BRIDGE_PID=$!
cd ..

# Wait for server to be ready
sleep 2

# Open demo UI
echo "  🌐 Opening demo UI in browser..."
if command -v xdg-open &> /dev/null; then
  xdg-open "demo-ui/index.html"
elif command -v open &> /dev/null; then
  open "demo-ui/index.html"
else
  echo "  📂 Open manually: demo-ui/index.html"
fi

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║      CodePulse is now running! 🎉        ║"
echo "  ╠══════════════════════════════════════════╣"
echo "  ║  Bridge:  http://localhost:3000           ║"
echo "  ║  Status:  http://localhost:3000/status    ║"
echo "  ║  Demo UI: demo-ui/index.html              ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

# Keep running
wait $BRIDGE_PID
