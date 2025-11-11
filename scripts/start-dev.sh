#!/bin/bash

echo "🚀 Starting Lost & Found App in development mode..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check ports
echo "🔍 Checking ports..."
if ! check_port 5000; then
    echo "Please stop the service using port 5000"
    exit 1
fi

if ! check_port 8000; then
    echo "Please stop the service using port 8000"
    exit 1
fi

if ! check_port 5173; then
    echo "Please stop the service using port 5173"
    exit 1
fi

echo "✅ All ports are available"

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start AI service
echo "🤖 Starting AI service..."
cd python-ai
source venv/bin/activate
python app.py &
AI_PID=$!
cd ..

# Wait a moment for AI service to start
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 All services started!"
echo ""
echo "📍 Services running on:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:5000"
echo "   - AI Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $AI_PID $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait
