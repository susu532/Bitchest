#!/bin/bash

# Bitchest - Full Stack Cryptocurrency Trading Application
# Startup Script

echo "Starting Bitchest..."
echo "===================="

# Start backend
echo "Starting Laravel backend on port 8000..."
cd backend
php -S localhost:8000 -t public &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend
echo "Starting React frontend on port 5173..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "===================="
echo "Bitchest is running!"
echo "===================="
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000/api"
echo ""
echo "Test Credentials:"
echo "Admin:  admin@bitchest.example / admin123"
echo "Client: bruno@bitchest.example / bruno123"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
