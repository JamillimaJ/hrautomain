#!/bin/bash

echo "🚀 Starting HR Automation System..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment not found!"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    PYTHON="venv/bin/python"
elif [ -d ".venv" ]; then
    source .venv/bin/activate
    PYTHON=".venv/bin/python"
fi

# Start backend in background
echo "🔧 Starting Django backend server..."
cd backend
python manage.py runserver > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start email analyzer in background
echo "📧 Starting email analyzer..."
cd emailanalysis
$PYTHON emailanalysis.py > ../emailanalysis.log 2>&1 &
EMAIL_PID=$!
cd ..

# Start frontend
echo "🌐 Starting frontend server..."
cd frontend
python -m http.server 3000 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ System is running!"
echo ""
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000/api/"
echo "🔗 Admin Panel: http://localhost:8000/admin/"
echo ""
echo "📝 Backend logs: tail -f backend.log"
echo "📝 Frontend logs: tail -f frontend.log"
echo "📝 Email analyzer logs: tail -f emailanalysis.log"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID $EMAIL_PID 2>/dev/null; echo '👋 Servers stopped'; exit" INT
wait
