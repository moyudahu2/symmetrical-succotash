@echo off
setlocal
cd /d "%~dp0dist"
echo Starting CET-4 Memory App (production build)...
echo Please open http://localhost:5173 in your browser
echo.
python -m http.server 5173
pause
