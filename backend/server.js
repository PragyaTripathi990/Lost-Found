import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './utils/database.js';

// Import routes
import itemRoutes from './routes/items.js';
import searchRoutes from './routes/search.js';
import uploadRoutes from './routes/upload.js';
import imageRoutes from './routes/images.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lost & Found API is running' });
});

// Auto-archive old items function
async function autoArchiveOldItems() {
  try {
    const result = await pool.query(
      `UPDATE items 
       SET status = 'archived', archived_at = NOW(), updated_at = NOW()
       WHERE status = 'active' 
       AND created_at < NOW() - INTERVAL '14 days'
       RETURNING id, title`
    );
    
    if (result.rows.length > 0) {
      console.log(`📦 Auto-archived ${result.rows.length} items older than 14 days`);
      result.rows.forEach(item => {
        console.log(`   - Item #${item.id}: ${item.title}`);
      });
    }
  } catch (error) {
    console.warn('⚠️ Auto-archive check skipped (database may not be configured):', error.message);
  }
}

// Run auto-archive on startup and every 6 hours
autoArchiveOldItems();
setInterval(autoArchiveOldItems, 6 * 60 * 60 * 1000); // Every 6 hours

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Auto-archive: Items older than 14 days will be automatically archived`);
});
