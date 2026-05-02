#!/bin/bash
# ============================================
# Service Status Checker
# ============================================

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

lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && ((RUNNING++))
lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 && ((RUNNING++))
lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 && ((RUNNING++))

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

# Made with Bob
