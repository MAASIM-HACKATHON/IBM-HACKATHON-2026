#!/bin/bash
# ============================================
# macOS/Linux Startup Script (WITH LOGS)
# ============================================
# This version shows all logs so you can see
# what's happening with the AI parser
# ============================================

set -e

echo ""
echo "========================================"
echo "  Starting Full-Stack MVP Application"
echo "========================================"
echo ""

# Check Prerequisites
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    exit 1
fi

echo "[INFO] Node.js and Python detected"
echo ""

# Install Dependencies
echo "[1/6] Checking client dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing client dependencies..."
    npm install
else
    echo "[INFO] Client dependencies already installed"
fi
cd ..

echo "[2/6] Checking server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing server dependencies..."
    npm install
else
    echo "[INFO] Server dependencies already installed"
fi
cd ..

echo "[3/6] Checking Python parser dependencies..."
cd server/python-parser
if [ ! -d "venv" ]; then
    echo "[INFO] Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "[INFO] Installing Python dependencies..."
./venv/bin/pip3 install -r requirements.txt > /dev/null 2>&1 || echo "[WARNING] Some Python packages may have failed"
cd ../..

# Cleanup function
cleanup() {
    echo ""
    echo "========================================"
    echo "  Stopping all services..."
    echo "========================================"
    
    jobs -p | xargs -r kill 2>/dev/null || true
    lsof -ti:8000 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs -r kill -9 2>/dev/null || true
    
    echo "[INFO] All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python Parser
echo "[4/6] Starting Python Parser service..."
cd server/python-parser
./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
PYTHON_PID=$!
cd ../..
sleep 3

if ps -p $PYTHON_PID > /dev/null 2>&1; then
    echo "[SUCCESS] Python Parser started (PID: $PYTHON_PID)"
else
    echo "[ERROR] Python Parser failed to start"
fi

# Start Server (NO OUTPUT REDIRECT - SHOW LOGS!)
echo "[5/6] Starting server..."
echo ""
echo "========================================"
echo "  WATCH FOR THIS IN SERVER LOGS:"
echo "  ✅ Watsonx AI client initialized"
echo "     Model: meta-llama/llama-3-8b-instruct"
echo "========================================"
echo ""
cd server
npm run dev &  # <-- NO > /dev/null 2>&1 !
SERVER_PID=$!
cd ..
sleep 5  # Give it time to show initialization logs

# Start Client
echo "[6/6] Starting client..."
cd client
npm run dev &  # <-- NO > /dev/null 2>&1 !
CLIENT_PID=$!
cd ..
sleep 2

echo ""
echo "========================================"
echo "  All services started!"
echo "========================================"
echo ""
echo "  Client:        http://localhost:5173"
echo "  Server:        http://localhost:3001"
echo "  Python Parser: http://localhost:8000"
echo ""
echo "  Check AI Status:"
echo "  http://localhost:3001/api/resume/ai-status"
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
