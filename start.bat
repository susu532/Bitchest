@echo off
REM Bitchest - Startup Script for Windows
REM This script starts both the Laravel backend and React frontend

echo Starting Bitchest...
echo ====================

REM Start backend in a new window
echo Starting Laravel backend on http://localhost:8000...
start "Bitchest Backend" cmd /k "cd /d %~dp0backend && php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 2

REM Start frontend in a new window
echo Starting React frontend on http://localhost:5173...
start "Bitchest Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ====================
echo Bitchest is starting!
echo ====================
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000/api
echo.
echo Test Credentials:
echo Admin:  admin@bitchest.example / admin123
echo Client: bruno@bitchest.example / bruno123
echo.
echo Close both command windows to stop the servers.

exit /b 0
