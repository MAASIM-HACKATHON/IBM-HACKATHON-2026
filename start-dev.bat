@echo off
echo ========================================
echo Smart Email Composer - Starting Development Servers
echo ========================================
echo.

echo Starting Server (Port 3001)...
start "Email Composer Server" cmd /k "cd /d C:\xampp\htdocs\repository\IBM-HACKATHON-2026\server && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Client (Port 5173)...
start "Email Composer Client" cmd /k "cd /d C:\xampp\htdocs\repository\IBM-HACKATHON-2026\client && npm run dev"

echo.
echo ========================================
echo Development Servers Starting...
echo ========================================
echo.
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
echo Two terminal windows have been opened:
echo   1. Email Composer Server (Backend)
echo   2. Email Composer Client (Frontend)
echo.
echo Once both servers are running, open your browser:
echo   http://localhost:5173
echo.
echo To stop servers, close the terminal windows or press Ctrl+C in each.
echo.
echo Press any key to exit this window...
pause > nul
