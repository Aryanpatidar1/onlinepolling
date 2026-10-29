@echo off
cd /d "%~dp0"
title MongoDB Server
echo Starting Local MongoDB on 127.0.0.1:27017...
if not exist "data\db" mkdir "data\db"
"C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "data\db" --port 27017 --bind_ip 127.0.0.1
pause
