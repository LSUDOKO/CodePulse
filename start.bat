@echo off
REM ╔══════════════════════════════════════════════════════╗
REM ║       CodePulse — Startup Script (Windows)           ║
REM ╚══════════════════════════════════════════════════════╝

echo.
echo   ⚡ Starting CodePulse...
echo.

REM Check for .env
if not exist ".env" (
  if exist ".env.example" (
    copy .env.example .env
    echo   Created .env from .env.example
    echo   IMPORTANT: Add your GEMINI_API_KEY to .env
    echo.
  )
)

REM Install bridge dependencies
echo   Installing bridge dependencies...
cd bridge
call npm install --silent
cd ..
echo   Dependencies installed
echo.

REM Start bridge server
echo   Starting bridge server on port 3000...
start "CodePulse Bridge" cmd /k "cd bridge && node server.js"

REM Wait for startup
timeout /t 3 /nobreak > nul

REM Open demo UI
echo   Opening demo UI...
start "" "demo-ui\index.html"

echo.
echo   ╔══════════════════════════════════════════╗
echo   ║      CodePulse is now running! 🎉        ║
echo   ╠══════════════════════════════════════════╣
echo   ║  Bridge:  http://localhost:3000           ║
echo   ║  Status:  http://localhost:3000/status    ║
echo   ║  Demo UI: demo-ui/index.html              ║
echo   ╚══════════════════════════════════════════╝
echo.
