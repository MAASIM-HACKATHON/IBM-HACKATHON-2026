#!/bin/bash
# ============================================
# macOS/Linux Unified Startup Script
# ============================================
# Components:
# - Client (React/Vite on port 5173)
# - Server (Next.js on port 3001)
# - Python Parser (FastAPI on port 8000)
# ============================================
# Usage:
#   ./start-mac.sh           - Start with minimal output
#   ./start-mac.sh --logs    - Start with full logs visible
#   ./start-mac.sh --check   - Check service status only
#   ./start-mac.sh --help    - Show this help
# ============================================

set -e  # Exit on error

# ============================================
# Parse Command Line Arguments
# ============================================
SHOW_LOGS=false
CHECK_ONLY=false

for arg in "$@"; do
    case $arg in
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --check)
            CHECK_ONLY=true
            shift
            ;;
        --help|-h)
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  (no args)    Start all services with minimal output"
            echo "  --logs       Start all services with full logs visible"
            echo "  --check      Check status of running services"
            echo "  --help, -h   Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo "[ERROR] Unknown option: $arg"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# ============================================
# Function: Check Service Status
# ============================================
check_services() {
    echo ""
    echo "========================================"
    echo "  Checking Service Status"
    echo "========================================"
    echo ""

    # Check Python Parser (port 8000)
    echo "🔍 Python Parser (port 8000):"
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :8000 -sTCP:LISTEN -t)
        echo "  ✅ RUNNING (PID: $PID)"
        echo "  📍 URL: http://localhost:8000"
        echo "  📚 Docs: http://localhost:8000/docs"
        
        # Test if responding
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo "  ✅ Health check: PASSED"
        else
            echo "  ⚠️  Health check: FAILED (service may be starting)"
        fi
    else
        echo "  ❌ NOT RUNNING"
        echo "  💡 Try: cd server/python-parser && ./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    fi

    echo ""

    # Check Server (port 3001)
    echo "🔍 Next.js Server (port 3001):"
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :3001 -sTCP:LISTEN -t)
        echo "  ✅ RUNNING (PID: $PID)"
        echo "  📍 URL: http://localhost:3001"
        echo "  🔍 AI Status: http://localhost:3001/api/resume/ai-status"
    else
        echo "  ❌ NOT RUNNING"
        echo "  💡 Try: cd server && npm run dev"
    fi

    echo ""

    # Check Client (port 5173)
    echo "🔍 React Client (port 5173):"
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :5173 -sTCP:LISTEN -t)
        echo "  ✅ RUNNING (PID: $PID)"
        echo "  📍 URL: http://localhost:5173"
    else
        echo "  ❌ NOT RUNNING"
        echo "  💡 Try: cd client && npm run dev"
    fi

    echo ""
    echo "========================================"
    echo "  Summary"
    echo "========================================"

    RUNNING=0
    TOTAL=3

    lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && ((RUNNING++)) || true
    lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 && ((RUNNING++)) || true
    lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 && ((RUNNING++)) || true

    echo "  Services running: $RUNNING/$TOTAL"

    if [ $RUNNING -eq $TOTAL ]; then
        echo "  ✅ All services are running!"
    elif [ $RUNNING -eq 0 ]; then
        echo "  ❌ No services are running"
        echo "  💡 Run: ./start-mac.sh"
    else
        echo "  ⚠️  Some services are not running"
        echo "  💡 Check the output above for details"
    fi

    echo ""
}

# ============================================
# If --check flag, just check status and exit
# ============================================
if [ "$CHECK_ONLY" = true ]; then
    check_services
    exit 0
fi

# ============================================
# Start Services
# ============================================
echo ""
echo "========================================"
echo "  Starting Full-Stack MVP Application"
if [ "$SHOW_LOGS" = true ]; then
    echo "  Mode: WITH LOGS"
else
    echo "  Mode: MINIMAL OUTPUT"
fi
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
    jobs -p | xargs kill 2>/dev/null || true
    
    # Kill processes by port (backup)
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
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

# Start the service
echo "[INFO] Starting uvicorn server..."
if [ "$SHOW_LOGS" = true ]; then
    ./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
else
    ./venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /dev/null 2>&1 &
fi
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
if [ "$SHOW_LOGS" = true ]; then
    echo ""
    echo "========================================"
    echo "  WATCH FOR THIS IN SERVER LOGS:"
    echo "  ✅ Watsonx AI client initialized"
    echo "     Model: meta-llama/llama-3-8b-instruct"
    echo "========================================"
    echo ""
fi

cd server
if [ "$SHOW_LOGS" = true ]; then
    npm run dev &
else
    npm run dev > /dev/null 2>&1 &
fi
SERVER_PID=$!
cd ..

if [ "$SHOW_LOGS" = true ]; then
    sleep 5  # Give it time to show initialization logs
else
    sleep 2
fi

# ============================================
# STEP 6: Start Client (Vite)
# ============================================
echo "[6/6] Starting client..."
cd client
if [ "$SHOW_LOGS" = true ]; then
    npm run dev &
else
    npm run dev > /dev/null 2>&1 &
fi
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
echo "  Check AI Status:"
echo "  http://localhost:3001/api/resume/ai-status"
echo ""
echo "  Process IDs:"
echo "  - Python Parser: $PYTHON_PID"
echo "  - Server:        $SERVER_PID"
echo "  - Client:        $CLIENT_PID"
echo ""
if [ "$SHOW_LOGS" = true ]; then
    echo "  📋 Logs are visible below"
else
    echo "  💡 To see logs, restart with: ./start-mac.sh --logs"
fi
echo "  🔍 To check status: ./start-mac.sh --check"
echo "  ⏹️  Press Ctrl+C to stop all services..."
echo "========================================"
echo ""

# Wait for all background processes
wait

# Made with Bob
