# Lost & Found

**AI-Powered Campus Search Platform with Semantic Similarity**

Search for lost items using natural language descriptions or photos. Built with a multi-service architecture --- Express REST API for core operations and a FastAPI microservice running CLIP for cross-modal vector search. Deployed campus-wide and adopted by 2000+ students.

---

## Architecture

```
React Frontend (Vite + TailwindCSS)
        |
        v
Express REST API (Node.js)
    |           |           |
    v           v           v
 Items       Search      Upload
 CRUD      Orchestrator  Pipeline
    |           |           |
    v           v           v
Supabase    FastAPI      Supabase
(PostgreSQL) AI Service   Storage
              |
              v
         CLIP Model
    (HuggingFace Transformers)
              |
              v
     Vector Embeddings
              |
              v
    pgvector Similarity Search
    (Cosine Distance Ranking)
```

## How It Works

### Upload Flow
1. User uploads image(s) + text description
2. Images stored in Supabase Storage
3. CLIP model generates vector embeddings for both image and text
4. Embeddings stored in PostgreSQL via pgvector extension

### Search Flow
1. User enters text query OR uploads a photo
2. CLIP generates embedding for the query
3. pgvector performs cosine similarity search against stored embeddings
4. Results ranked by similarity score and returned

### Cross-Modal Search
CLIP captures semantic meaning across modalities:
- **Text to Image**: "blue water bottle" finds photos of blue bottles
- **Image to Image**: Upload a photo to find visually similar items
- **Hybrid**: Combined text + image query for highest precision

## Key Features

| Feature | Details |
|---|---|
| Multi-Service Backend | Express API + FastAPI AI microservice |
| Cross-Modal Search | Text-to-image, image-to-image, hybrid search |
| Vector Search | pgvector with cosine-distance indexing |
| Campus Filtering | Filter by campus location (Uniworld 1, Uniworld 2, SST) |
| Auto-Archive | Items older than 2 weeks automatically archived |
| Multi-Image Upload | Multiple images per item via Supabase Storage |
| Sub-Second Retrieval | Optimized vector index for fast similarity queries |

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Lucide Icons, Axios |
| **API Server** | Node.js, Express |
| **AI Service** | Python, FastAPI, CLIP (HuggingFace Transformers) |
| **Database** | PostgreSQL + pgvector (via Supabase) |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel (frontend), Render (backend) |

## API Endpoints

### Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | List items with pagination |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Search
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/search/text` | Text-based semantic search |
| POST | `/api/search/image` | Image-based similarity search |
| POST | `/api/search/hybrid` | Combined text + image search |

### Upload
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/image` | Upload single image |
| POST | `/api/upload/images` | Upload multiple images |

## Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account (with pgvector enabled)

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Add Supabase credentials
npm run dev
```

### AI Service
```bash
cd python-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Set API URL
npm run dev
```

## Production

Adopted campus-wide at Scaler School of Technology across 3 campus locations with 2000+ active student users.

## License

MIT

<!-- test: verifying push pipeline -->

