#!/bin/bash

echo "🚀 Starting HR Automation Backend..."

# Start email analysis script in background
echo "📧 Starting email analysis monitor..."
cd /app/emailanalysis
nohup python emailanalysis.py > /app/outputs/email_monitor.log 2>&1 &
EMAIL_PID=$!
echo "✅ Email monitor started (PID: $EMAIL_PID)"

# Go back to backend directory
cd /app/backend

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate --noinput || true

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput || true

# Start Django server
echo "🌐 Starting Django server on 0.0.0.0:5512..."
exec python manage.py runserver 0.0.0.0:5512
