import express from 'express';
import { pool } from '../utils/database.js';

const router = express.Router();

// Campus options
const CAMPUS_OPTIONS = ['Uniworld 1', 'Uniworld 2', 'SST Campus'];

// Get all items with pagination (excludes archived by default)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      location, 
      campus,
      status = 'active',
      includeArchived = false 
    } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, title, description, location, campus, type, image_url, 
             created_at, status, contact_info, archived_at
      FROM items 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    // Filter by status (default: only active items)
    if (includeArchived !== 'true') {
      query += ` AND status = $${++paramCount}`;
      params.push(status);
    }
    
    if (type) {
      query += ` AND type = $${++paramCount}`;
      params.push(type);
    }
    
    if (location) {
      query += ` AND location ILIKE $${++paramCount}`;
      params.push(`%${location}%`);
    }
    
    if (campus) {
      query += ` AND campus = $${++paramCount}`;
      params.push(campus);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM items WHERE 1=1`;
    const countParams = [];
    let countParamIdx = 0;
    
    if (includeArchived !== 'true') {
      countQuery += ` AND status = $${++countParamIdx}`;
      countParams.push(status);
    }
    if (type) {
      countQuery += ` AND type = $${++countParamIdx}`;
      countParams.push(type);
    }
    if (campus) {
      countQuery += ` AND campus = $${++countParamIdx}`;
      countParams.push(campus);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
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
          campus: "Uniworld 1",
          type: "found",
          image_url: "https://via.placeholder.com/300x200?text=Water+Bottle",
          created_at: new Date().toISOString(),
          status: "active"
        },
        {
          id: 2,
          title: "Blue Umbrella",
          description: "Navy blue umbrella left in the cafeteria",
          location: "Cafeteria",
          campus: "Uniworld 2",
          type: "found",
          image_url: "https://via.placeholder.com/300x200?text=Umbrella",
          created_at: new Date().toISOString(),
          status: "active"
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1
      }
    });
  }
});

// Get campus options
router.get('/campuses', (req, res) => {
  res.json({
    success: true,
    data: CAMPUS_OPTIONS
  });
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
    const { 
      title, 
      description, 
      location, 
      campus = 'Uniworld 1',
      type, 
      image_url, 
      image_embedding, 
      text_embedding,
      contact_info
    } = req.body;
    
    // Validate campus
    if (!CAMPUS_OPTIONS.includes(campus)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid campus. Must be one of: ${CAMPUS_OPTIONS.join(', ')}` 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO items (title, description, location, campus, type, image_url, 
                          image_embedding, text_embedding, contact_info, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       RETURNING *`,
      [title, description, location, campus, type, image_url, image_embedding, text_embedding, contact_info]
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
    const { title, description, location, campus, type, image_url, image_embedding, text_embedding } = req.body;
    
    // Validate campus if provided
    if (campus && !CAMPUS_OPTIONS.includes(campus)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid campus. Must be one of: ${CAMPUS_OPTIONS.join(', ')}` 
      });
    }
    
    const result = await pool.query(
      `UPDATE items 
       SET title = $1, description = $2, location = $3, campus = COALESCE($4, campus),
           type = $5, image_url = $6, image_embedding = $7, text_embedding = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, description, location, campus, type, image_url, image_embedding, text_embedding, id]
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

// Mark item as found/resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE items 
       SET status = 'resolved', updated_at = NOW()
       WHERE id = $1 AND status = 'active'
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found or already resolved/archived' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Item marked as found/resolved successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error resolving item:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve item' });
  }
});

// Archive an item manually
router.patch('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE items 
       SET status = 'archived', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'active'
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found or already archived' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Item archived successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error archiving item:', error);
    res.status(500).json({ success: false, error: 'Failed to archive item' });
  }
});

// Auto-archive old items (items older than 14 days)
router.post('/auto-archive', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE items 
       SET status = 'archived', archived_at = NOW(), updated_at = NOW()
       WHERE status = 'active' 
       AND created_at < NOW() - INTERVAL '14 days'
       RETURNING id, title`
    );
    
    console.log(`Auto-archived ${result.rows.length} items`);
    
    res.json({ 
      success: true, 
      message: `Auto-archived ${result.rows.length} items older than 14 days`,
      archivedItems: result.rows
    });
  } catch (error) {
    console.error('Error auto-archiving items:', error);
    res.status(500).json({ success: false, error: 'Failed to auto-archive items' });
  }
});

// Get archived items (for admin/special requests)
router.get('/archived/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, campus } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, title, description, location, campus, type, image_url, 
             created_at, archived_at, contact_info, status
      FROM items 
      WHERE status = 'archived'
    `;
    const params = [];
    let paramCount = 0;
    
    if (campus) {
      query += ` AND campus = $${++paramCount}`;
      params.push(campus);
    }
    
    query += ` ORDER BY archived_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
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
    console.error('Error fetching archived items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch archived items' });
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
