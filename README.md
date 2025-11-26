# Lost & Found App with AI-Powered Search

A modern web application that helps users find lost items using AI-powered image and text search capabilities. Built with React, Node.js, and CLIP embeddings for semantic similarity search.

## Features

- 🔍 **Text Search**: Search for items using natural language descriptions
- 📸 **Image Search**: Upload photos to find visually similar items
- 🤖 **AI-Powered**: Uses CLIP model for semantic understanding
- 📍 **Location Filtering**: Filter results by location
- 📱 **Modern UI**: Beautiful, responsive interface with TailwindCSS
- ⚡ **Fast Search**: Vector similarity search with pgvector

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS for styling
- Lucide React for icons
- Axios for API calls

### Backend
- Node.js + Express
- PostgreSQL with pgvector extension
- Supabase for storage and database

### AI Service
- Python + FastAPI
- CLIP model (HuggingFace Transformers)
- Vector embeddings for similarity search

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL with pgvector extension
- Supabase account

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Lost&Found
```

### 2. Database Setup

1. Create a Supabase project
2. Enable the pgvector extension in your database
3. Run the SQL schema:

```sql
-- See database/schema.sql for the complete schema
```

### 3. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### 4. AI Service Setup

```bash
cd python-ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 5. Frontend Setup

```bash
cd frontend
npm install
cp env.example .env
# Edit .env with your API URL
npm run dev
```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url
PORT=5000
NODE_ENV=development
AI_SERVICE_URL=http://localhost:8000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

### Items
- `GET /api/items` - Get all items with pagination
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Search
- `POST /api/search/text` - Text-based search
- `POST /api/search/image` - Image-based search
- `POST /api/search/hybrid` - Combined text and image search

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images

## How It Works

1. **Upload Process**:
   - User uploads image(s) with description
   - Image is stored in Supabase storage
   - CLIP model generates embeddings for both image and text
   - Embeddings are stored in PostgreSQL with pgvector

2. **Search Process**:
   - User enters text query or uploads image
   - CLIP generates embedding for the query
   - Vector similarity search finds most similar items
   - Results are ranked by similarity score

3. **AI Similarity**:
   - CLIP embeddings capture semantic meaning
   - "water bottle" matches "flask" or "bottle"
   - Visual similarity finds items with similar appearance
   - Cross-modal search: text can find images and vice versa

## Development

### Running All Services

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: AI Service
cd python-ai && python app.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

### Database Migrations

The database schema is in `database/schema.sql`. Run this in your Supabase SQL editor to set up the tables and indexes.

## Deployment

### Backend
- Deploy to Railway, Heroku, or similar
- Set environment variables
- Ensure database connection

### AI Service
- Deploy to Railway, Google Cloud Run, or similar
- Install Python dependencies
- Set up model caching

### Frontend
- Deploy to Vercel, Netlify, or similar
- Set environment variables
- Update API URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
