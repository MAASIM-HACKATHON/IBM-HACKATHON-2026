#!/bin/bash
# ============================================
# Quick Restart Script with Clean Rebuild
# ============================================

set -e

echo ""
echo "========================================"
echo "  Restarting with Clean Rebuild"
echo "========================================"
echo ""

# ============================================
# STEP 1: Stop All Services
# ============================================
echo "[1/4] Stopping all services..."

# Kill processes by port
lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "  Python Parser not running"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "  Server not running"
lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "  Client not running"

sleep 2
echo "  ✅ All services stopped"
echo ""

# ============================================
# STEP 2: Clean Server Build Cache
# ============================================
echo "[2/4] Cleaning server build cache..."
cd server

if [ -d ".next" ]; then
    echo "  Removing .next directory..."
    rm -rf .next
fi

echo "  ✅ Cache cleaned"
echo ""

# ============================================
# STEP 3: Rebuild Server
# ============================================
echo "[3/4] Rebuilding server..."
echo "  This will take 10-20 seconds..."
npm run build

echo "  ✅ Server rebuilt"
echo ""

cd ..

# ============================================
# STEP 4: Start All Services (WITH LOGS)
# ============================================
echo "[4/4] Starting all services..."
echo ""
echo "========================================"
echo "  IMPORTANT: Watch for this message:"
echo "  ✅ Watsonx AI client initialized"
echo "     Model: meta-llama/llama-3-8b-instruct"
echo "========================================"
echo ""

# Start Python Parser
echo "Starting Python Parser..."
cd server/python-parser
./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
PYTHON_PID=$!
cd ../..
sleep 2

# Start Server (WITH LOGS - no redirect!)
echo "Starting Server..."
cd server
npm run dev &
SERVER_PID=$!
cd ..
sleep 3

# Start Client
echo "Starting Client..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..
sleep 2

echo ""
echo "========================================"
echo "  ✅ All Services Started"
echo "========================================"
echo ""
echo "  Client:        http://localhost:5173"
echo "  Server:        http://localhost:3001"
echo "  Python Parser: http://localhost:8000"
echo ""
echo "  Check AI Status:"
echo "  http://localhost:3001/api/resume/ai-status"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "========================================"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $PYTHON_PID $SERVER_PID $CLIENT_PID 2>/dev/null || true
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo "All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for all processes
wait
