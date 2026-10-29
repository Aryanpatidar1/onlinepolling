@echo off
cd /d "%~dp0"
title PrimePoll Launcher
echo ====================================================
echo        Starting PrimePoll (Fullstack Application)
echo ====================================================
echo Database: MongoDB Atlas (Cloud Cluster0)
echo.

echo 1. Launching Backend Server...
start "PrimePoll - Backend" cmd /k "start-backend.bat"
timeout /t 2 /nobreak >nul

echo 2. Launching Frontend Server...
start "PrimePoll - Frontend" cmd /k "start-frontend.bat"

echo.
echo All services launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:3001
echo.
pause
