@echo off
REM ============================================
REM Windows Startup Script for Full-Stack MVP
REM ============================================
REM Components:
REM - Client (React/Vite on port 5173)
REM - Server (Next.js on port 3001)
REM - Python Parser (FastAPI on port 8000)
REM ============================================

echo.
echo ========================================
echo   Starting Full-Stack MVP Application
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [INFO] Node.js and Python detected
echo.

REM ============================================
REM STEP 1: Install Client Dependencies
REM ============================================
echo [1/6] Checking client dependencies...
cd client
if not exist "node_modules\" (
    echo [INFO] Installing client dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install client dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [INFO] Client dependencies already installed
)
cd ..

REM ============================================
REM STEP 2: Install Server Dependencies
REM ============================================
echo [2/6] Checking server dependencies...
cd server
if not exist "node_modules\" (
    echo [INFO] Installing server dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install server dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [INFO] Server dependencies already installed
)
cd ..

REM ============================================
REM STEP 3: Install Python Parser Dependencies
REM ============================================
echo [3/6] Checking Python parser dependencies...
cd server\python-parser
if not exist "venv\" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment
        cd ..\..
        pause
        exit /b 1
    )
)

echo [INFO] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some Python packages may have failed to install
)
call deactivate
cd ..\..

REM ============================================
REM STEP 4: Start Python Parser Service
REM ============================================
echo [4/6] Starting Python Parser service...
start "Python Parser" cmd /k "cd server\python-parser && venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

REM ============================================
REM STEP 5: Start Server (Next.js)
REM ============================================
echo [5/6] Starting server...
start "Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul

REM ============================================
REM STEP 6: Start Client (Vite)
REM ============================================
echo [6/6] Starting client...
start "Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   All services started successfully!
echo ========================================
echo.
echo   Client:        http://localhost:5173
echo   Server:        http://localhost:3001
echo   Python Parser: http://localhost:8000
echo.
echo   Press any key to stop all services...
echo ========================================
pause >nul

REM Kill all spawned processes
taskkill /FI "WindowTitle eq Client*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq Server*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq Python Parser*" /T /F >nul 2>nul

echo.
echo All services stopped.
pause

@REM Made with Bob
