#!/bin/bash

# COINS Dashboard Startup Script
# This script starts both the Flask backend and React frontend.

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    # Kill all child processes (the backend)
    pkill -P $$ 
    exit
}

# Trap Ctrl+C (SIGINT) and Exit (EXIT) to run cleanup
trap cleanup SIGINT EXIT

# Get the absolute path to the project root
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=================================================="
echo "   Starting COINS Live Trading Dashboard"
echo "=================================================="

# --- 1. Start Backend ---
echo "Also checking backend setup..."
cd "$PROJECT_ROOT/code/backend" || exit

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing backend dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Export Backend Environment Variables from Frontend .env
if [ -f "$PROJECT_ROOT/code/frontend/.env" ]; then
    echo "Loading environment variables from frontend .env..."
    export GOOGLE_CLIENT_ID=$(grep VITE_GOOGLE_CLIENT_ID "$PROJECT_ROOT/code/frontend/.env" | cut -d '=' -f2)
    export ALLOWED_EMAILS=$(grep VITE_ALLOWED_EMAILS "$PROJECT_ROOT/code/frontend/.env" | cut -d '=' -f2)
    echo "✅ Backend Configured."
fi

# Run Flask app in background
echo "🚀 Starting Flask Backend..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# --- 2. Start Frontend ---
echo "Also checking frontend setup..."
cd "$PROJECT_ROOT/code/frontend" || exit

# Check if node_modules exists, install if not
if [ ! -d "node_modules" ]; then
    echo "⚠️  Node modules not found. Installing..."
    npm install
fi

echo "🚀 Starting Vite Frontend..."
echo "--------------------------------------------------"
echo "   Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://127.0.0.1:5000"
echo "--------------------------------------------------"
echo "Press Ctrl+C to stop both servers."
echo "--------------------------------------------------"

# Run npm run dev in foreground so we can see output and it keeps the script alive
npm run dev
