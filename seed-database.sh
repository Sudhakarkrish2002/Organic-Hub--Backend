#!/bin/bash

# Organic Hub Database Seeding Script
echo "🌱 Starting Organic Hub Database Seeding..."

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
    echo "📝 Creating .env file from example..."
    cp env.example .env
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "❌ Error: MongoDB is not running on localhost:27017"
    echo "💡 Please start MongoDB first:"
    echo "   - On macOS: brew services start mongodb-community"
    echo "   - On Windows: Start MongoDB service"
    echo "   - On Linux: sudo systemctl start mongod"
    exit 1
fi

echo "✅ MongoDB is running"

# Run the seeding script
echo "🌱 Running database seeding..."
echo "📊 This will create:"
echo "   - 5 categories (Vegetables, Fruits, Dairy, Grains, Natural)"
echo "   - 3 users (2 customers, 1 admin)"
echo "   - 8 products (organic products with images)"
echo "   - 9 orders (3 orders per user)"
echo ""

npm run seed

echo ""
echo "🎉 Database seeding completed!"
echo "📱 You can now view the data in MongoDB Compass"
echo "🔗 Database: organic-hub"
echo "👥 Users: john@example.com, jane@example.com, mike@example.com"
echo "🔑 Password for all users: password123"
