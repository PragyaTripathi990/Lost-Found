# Lost & Found App - Deployment Guide

## Backend Deployment (Railway)

### 1. Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `Lost-Found` repository
5. Choose the `backend` folder as the root directory

### 2. Set Environment Variables in Railway
In Railway dashboard, go to your project → Variables tab and add:

```
NODE_ENV=production
PORT=5001
SUPABASE_URL=https://uiazxxywirupzjxhuqgu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYXp4eHl3aXJ1cHpqeGh1cWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzAwMDQsImV4cCI6MjA3NzIwNjAwNH0.WYw6d4a8aqY7Zz8tYQxOxBPkIP9AvBD5B8XWyp9nztA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYXp4eHl3aXJ1cHpqeGh1cWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMDAwNCwiZXhwIjoyMDc3MjA2MDA0fQ.utxki7ZPdTz0tT248D5eAd7MDJufbDBiefNeunl-rXA
DATABASE_URL=postgresql://neondb_owner:npg_sB28ISJnlZWO@ep-hidden-band-ahdvot0u-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
AI_SERVICE_URL=http://localhost:8001
```

### 3. Get Backend URL
After deployment, Railway will give you a URL like: `https://your-app-name.railway.app`

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project" → Import your `Lost-Found` repository
4. Set Root Directory to `frontend`
5. Build Command: `npm run build`
6. Output Directory: `dist`

### 2. Set Environment Variables in Vercel
In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```
VITE_API_URL=https://your-backend-url.railway.app/api
```

Replace `your-backend-url` with your actual Railway backend URL.

## Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.railway.app/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Test Upload**: Try uploading an item
4. **Test Search**: Try searching for items

## Notes

- The AI service is currently set to localhost, so it will use mock embeddings
- For production AI service, you'd need to deploy the Python service separately
- All database operations will work with the Neon PostgreSQL database
- File uploads will work with Supabase Storage

## Troubleshooting

- If backend fails: Check Railway logs
- If frontend can't connect: Verify VITE_API_URL is correct
- If uploads fail: Check Supabase credentials
- If search fails: Check database connection
