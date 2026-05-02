#!/bin/bash
# ============================================
# macOS/Linux Startup Script for Full-Stack MVP
# ============================================
# Components:
# - Client (React/Vite on port 5173)
# - Server (Next.js on port 3001)
# - Python Parser (FastAPI on port 8000)
# ============================================

set -e  # Exit on error

echo ""
echo "========================================"
echo "  Starting Full-Stack MVP Application"
echo "========================================"
echo ""

# ============================================
# Check Prerequisites
# ============================================
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3 from https://www.python.org/"
    exit 1
fi

echo "[INFO] Node.js and Python detected"
echo ""

# ============================================
# STEP 1: Install Client Dependencies
# ============================================
echo "[1/6] Checking client dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing client dependencies..."
    npm install
else
    echo "[INFO] Client dependencies already installed"
fi
cd ..

# ============================================
# STEP 2: Install Server Dependencies
# ============================================
echo "[2/6] Checking server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing server dependencies..."
    npm install
else
    echo "[INFO] Server dependencies already installed"
fi
cd ..

# ============================================
# STEP 3: Install Python Parser Dependencies
# ============================================
echo "[3/6] Checking Python parser dependencies..."
cd server/python-parser
if [ ! -d "venv" ]; then
    echo "[INFO] Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "[INFO] Installing Python dependencies..."
./venv/bin/pip3 install -r requirements.txt > /dev/null 2>&1 || echo "[WARNING] Some Python packages may have failed to install"
cd ../..

# ============================================
# Cleanup function for graceful shutdown
# ============================================
cleanup() {
    echo ""
    echo "========================================"
    echo "  Stopping all services..."
    echo "========================================"
    
    # Kill all background jobs
    jobs -p | xargs -r kill 2>/dev/null || true
    
    # Kill processes by port (backup)
    lsof -ti:8000 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs -r kill -9 2>/dev/null || true
    
    echo "[INFO] All services stopped"
    exit 0
}

# Register cleanup function for SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# ============================================
# STEP 4: Start Python Parser Service
# ============================================
echo "[4/6] Starting Python Parser service..."
cd server/python-parser

# Check if venv exists
if [ ! -f "venv/bin/python3" ]; then
    echo "[ERROR] Virtual environment not found at venv/bin/python3"
    cd ../..
    exit 1
fi

# Start the service with visible output for debugging
echo "[INFO] Starting uvicorn server..."
./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
PYTHON_PID=$!
cd ../..

# Wait and check if process is still running
sleep 3
if ps -p $PYTHON_PID > /dev/null 2>&1; then
    echo "[SUCCESS] Python Parser started (PID: $PYTHON_PID)"
    # Test if port is listening
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "[SUCCESS] Python Parser is listening on port 8000"
    else
        echo "[WARNING] Python Parser process running but port 8000 not listening yet"
    fi
else
    echo "[ERROR] Python Parser failed to start"
    echo "[INFO] Check server/python-parser directory for errors"
fi

# ============================================
# STEP 5: Start Server (Next.js)
# ============================================
echo "[5/6] Starting server..."
cd server
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
cd ..
sleep 2

# ============================================
# STEP 6: Start Client (Vite)
# ============================================
echo "[6/6] Starting client..."
cd client
npm run dev > /dev/null 2>&1 &
CLIENT_PID=$!
cd ..
sleep 2

# ============================================
# Display Status
# ============================================
echo ""
echo "========================================"
echo "  All services started successfully!"
echo "========================================"
echo ""
echo "  Client:        http://localhost:5173"
echo "  Server:        http://localhost:3001"
echo "  Python Parser: http://localhost:8000"
echo ""
echo "  Process IDs:"
echo "  - Python Parser: $PYTHON_PID"
echo "  - Server:        $SERVER_PID"
echo "  - Client:        $CLIENT_PID"
echo ""
echo "  Press Ctrl+C to stop all services..."
echo "========================================"
echo ""

# Wait for all background processes
wait

# Made with Bob

