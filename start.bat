@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
echo Starting CET-4 Memory App...
echo Please open http://localhost:5173 in your browser after startup
echo.
npx vite --host
pause
