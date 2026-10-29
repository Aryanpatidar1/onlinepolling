@echo off
cd /d "%~dp0"
title Backend Server - PrimePoll
echo Starting Backend on http://localhost:3001...
cd backend
npm run dev
pause
