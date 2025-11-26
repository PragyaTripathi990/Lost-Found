#!/bin/bash

echo "🚀 Setting up Lost & Found App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install Python AI service dependencies
echo "📦 Installing Python AI service dependencies..."
cd python-ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "✅ All dependencies installed!"

# Create environment files
echo "📝 Creating environment files..."

if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "📄 Created backend/.env - Please update with your Supabase credentials"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/env.example frontend/.env
    echo "📄 Created frontend/.env - Please update with your API URL"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase project and enable pgvector extension"
echo "2. Run the database schema from database/schema.sql"
echo "3. Update environment variables in backend/.env and frontend/.env"
echo "4. Start the services:"
echo "   - Backend: cd backend && npm run dev"
echo "   - AI Service: cd python-ai && source venv/bin/activate && python app.py"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "Happy coding! 🚀"
