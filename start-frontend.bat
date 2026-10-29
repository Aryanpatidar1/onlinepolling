@echo off
cd /d "%~dp0"
title Frontend Vite - PrimePoll
echo Starting Frontend on http://localhost:5173...
cd frontend
npm run dev
pause
