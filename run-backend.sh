#!/bin/bash

# Organic Hub Backend Startup Script
echo "🚀 Starting Organic Hub Backend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Organic-Hub--Backend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
fi

# Start the backend server
echo "🔧 Starting server on port 3000..."
echo "📱 Frontend URL: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3000"
echo "📊 Health Check: http://localhost:3000/health"
echo ""

# Run the backend
node server.js
