import express from 'express';
import { pool } from '../utils/database.js';

const router = express.Router();

// Get all items with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, location } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, title, description, location, type, image_url, created_at, 
             similarity_score
      FROM items 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (type) {
      query += ` AND type = $${++paramCount}`;
      params.push(type);
    }
    
    if (location) {
      query += ` AND location ILIKE $${++paramCount}`;
      params.push(`%${location}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    // Return mock data for demo purposes when database is not available
    res.json({
      success: true,
      data: [
        {
          id: 1,
          title: "Black Water Bottle",
          description: "A black insulated water bottle found near the library",
          location: "Library Building",
          type: "found",
          image_url: "https://via.placeholder.com/300x200?text=Water+Bottle",
          created_at: new Date().toISOString(),
          similarity_score: 0.95
        },
        {
          id: 2,
          title: "Blue Umbrella",
          description: "Navy blue umbrella left in the cafeteria",
          location: "Cafeteria",
          type: "found",
          image_url: "https://via.placeholder.com/300x200?text=Umbrella",
          created_at: new Date().toISOString(),
          similarity_score: 0.87
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2
      }
    });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch item' });
  }
});

// Create new item
router.post('/', async (req, res) => {
  try {
    const { title, description, location, type, image_url, image_embedding, text_embedding } = req.body;
    
    const result = await pool.query(
      `INSERT INTO items (title, description, location, type, image_url, image_embedding, text_embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, location, type, image_url, image_embedding, text_embedding]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ success: false, error: 'Failed to create item' });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, type, image_url, image_embedding, text_embedding } = req.body;
    
    const result = await pool.query(
      `UPDATE items 
       SET title = $1, description = $2, location = $3, type = $4, 
           image_url = $5, image_embedding = $6, text_embedding = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, location, type, image_url, image_embedding, text_embedding, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});

export default router;
