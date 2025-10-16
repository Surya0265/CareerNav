#!/bin/bash

# Test script to verify AI insights are being generated

echo "======================================"
echo "AI INSIGHTS VERIFICATION TEST"
echo "======================================"
echo ""

# Check 1: Environment variable
echo "1. Checking GEMINI_API_KEY..."
if [ -z "$GEMINI_API_KEY" ]; then
    echo "   ✗ GEMINI_API_KEY is NOT set"
    echo "   This is likely why fallback data is shown!"
    echo ""
    echo "   To fix:"
    echo "   - Windows: set GEMINI_API_KEY=your_key_here"
    echo "   - Linux/Mac: export GEMINI_API_KEY=\"your_key_here\""
else
    echo "   ✓ GEMINI_API_KEY is set"
    echo "   Key length: ${#GEMINI_API_KEY}"
fi
echo ""

# Check 2: Python server status
echo "2. Checking Python server..."
if curl -s http://127.0.0.1:5000/ > /dev/null 2>&1; then
    echo "   ✓ Python server is running"
else
    echo "   ✗ Python server is NOT running"
    echo "   Start it with: python app.py"
fi
echo ""

# Check 3: Node server status
echo "3. Checking Node server..."
if curl -s http://localhost:3011/api/ > /dev/null 2>&1; then
    echo "   ✓ Node server is running"
else
    echo "   ✗ Node server is NOT running"
    echo "   Start it with: npm start"
fi
echo ""

# Check 4: MongoDB status
echo "4. Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "   ✓ MongoDB is installed"
    # Try to connect
    if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "   ✓ MongoDB is running and accessible"
    else
        echo "   ✗ MongoDB is not running"
        echo "   Start it with: mongod"
    fi
else
    echo "   ⚠ MongoDB command not found (might still be running)"
fi
echo ""

echo "======================================"
echo "RECOMMENDATIONS:"
echo "======================================"
echo ""
echo "If GEMINI_API_KEY is not set:"
echo "  1. Get key from: https://aistudio.google.com/apikey"
echo "  2. Set it in environment"
echo "  3. Restart Python server"
echo "  4. Try finalize again"
echo ""
echo "The analysis page shows 'fallback data' ONLY when:"
echo "  - GEMINI_API_KEY is not set, OR"
echo "  - Gemini service failed to initialize, OR"
echo "  - Python /process endpoint failed to generate recommendations"
echo ""
echo "Check Python console for:"
echo "  - 'GEMINI_API_KEY present in environment: True'"
echo "  - 'Gemini AI service initialized successfully'"
echo "  - 'AI recommendations generated successfully'"
echo ""
