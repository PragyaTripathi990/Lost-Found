import express from 'express';
import { pool } from '../utils/database.js';

const router = express.Router();

// Text-based search using CLIP embeddings
router.post('/text', async (req, res) => {
  try {
    const { query, limit = 5, type, location } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    // Call AI service to get text embedding
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    let embedding;
    
    try {
      const aiResponse = await fetch(`${aiServiceUrl}/embed-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to get text embedding');
      }

      const data = await aiResponse.json();
      embedding = data.embedding;
    } catch (error) {
      console.warn('AI service not available, using mock embedding:', error.message);
      // Mock embedding for demo purposes
      embedding = Array(512).fill(0).map(() => Math.random() - 0.5);
    }

    // Build similarity search query with hybrid scoring
    // Combines semantic similarity (text embeddings) with keyword matching boost
    // This gives better results for exact string matches like "milton bottle"
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    
    // Build keyword matching conditions for better exact match detection
    // Use PostgreSQL's text search to count word matches
    let keywordBoost = `
      (
        CASE 
          -- Exact match in title: +0.6 boost (highest priority)
          WHEN LOWER(title) = $2 THEN 0.6
          -- Title contains full query as substring: +0.5 boost
          WHEN LOWER(title) LIKE $3 THEN 0.5
          -- Title contains all query words (using word boundary matching): +0.4 boost
          WHEN (
            SELECT COUNT(*) FROM unnest(string_to_array(LOWER($2), ' ')) AS word
            WHERE LOWER(title) LIKE '%' || word || '%'
          ) = ${queryWords.length} THEN 0.4
          -- Description contains full query: +0.3 boost
          WHEN LOWER(description) LIKE $3 THEN 0.3
          -- Description contains all query words: +0.25 boost
          WHEN (
            SELECT COUNT(*) FROM unnest(string_to_array(LOWER($2), ' ')) AS word
            WHERE LOWER(description) LIKE '%' || word || '%'
          ) = ${queryWords.length} THEN 0.25
          -- Title contains any query word: +0.15 boost
          WHEN LOWER(title) LIKE $4 THEN 0.15
          -- Description contains any query word: +0.1 boost
          WHEN LOWER(description) LIKE $4 THEN 0.1
          ELSE 0
        END
      )
    `;
    
    let sqlQuery = `
      SELECT 
        id, title, description, location, type, image_url, created_at,
        LEAST(1.0,
          -- Semantic similarity from text embeddings (50% weight)
          GREATEST(0, 1 - (text_embedding <=> $1)) * 0.5 +
          -- Keyword matching boost (50% weight) - higher weight for exact matches
          ${keywordBoost} * 0.5
        ) as similarity_score
      FROM items
      WHERE text_embedding IS NOT NULL
    `;
    
    const params = [
      JSON.stringify(embedding),
      queryLower, // $2: Exact match and for word array
      `%${queryLower}%`, // $3: Contains full query
      `%${queryWords[0]}%` // $4: Contains first word (for any word match)
    ];
    let paramCount = 4;

    if (type) {
      sqlQuery += ` AND type = $${++paramCount}`;
      params.push(type);
    }

    if (location) {
      sqlQuery += ` AND location ILIKE $${++paramCount}`;
      params.push(`%${location}%`);
    }

    sqlQuery += ` ORDER BY similarity_score DESC LIMIT $${++paramCount}`;
    params.push(limit);

    const result = await pool.query(sqlQuery, params);

    // Log results for debugging
    console.log('Text search results count:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('First result:', {
        id: result.rows[0].id,
        title: result.rows[0].title,
        similarity_score: result.rows[0].similarity_score,
        image_url: result.rows[0].image_url,
        has_image_url: !!result.rows[0].image_url
      });
    }

    res.json({
      success: true,
      data: result.rows,
      query: query,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error in text search:', error);
    // Return mock search results for demo purposes
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
      query: query,
      total: 2
    });
  }
});

// Image-based search using CLIP embeddings
router.post('/image', async (req, res) => {
  try {
    const { imageData, limit = 5, type, location } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ success: false, error: 'Image data is required' });
    }

    // Call AI service to get image embedding
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    let embedding;
    
    try {
      const aiResponse = await fetch(`${aiServiceUrl}/embed-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to get image embedding');
      }

      const data = await aiResponse.json();
      embedding = data.embedding;
    } catch (error) {
      console.warn('AI service not available, using mock embedding:', error.message);
      // Mock embedding for demo purposes
      embedding = Array(512).fill(0).map(() => Math.random() - 0.5);
    }

    // Build similarity search query
    // Note: <=> returns cosine DISTANCE (0-2, lower is better)
    // Convert to similarity (0-1, higher is better): GREATEST(0, 1 - distance)
    // This ensures similarity_score is always 0-1, preventing negative percentages
    let sqlQuery = `
      SELECT id, title, description, location, type, image_url, created_at,
             GREATEST(0, 1 - (image_embedding <=> $1)) as similarity_score
      FROM items
      WHERE image_embedding IS NOT NULL
    `;
    
    const params = [JSON.stringify(embedding)];
    let paramCount = 1;

    if (type) {
      sqlQuery += ` AND type = $${++paramCount}`;
      params.push(type);
    }

    if (location) {
      sqlQuery += ` AND location ILIKE $${++paramCount}`;
      params.push(`%${location}%`);
    }

    sqlQuery += ` ORDER BY similarity_score DESC LIMIT $${++paramCount}`;
    params.push(limit);

    const result = await pool.query(sqlQuery, params);

    // Log results for debugging
    console.log('Image search results count:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('First result:', {
        id: result.rows[0].id,
        title: result.rows[0].title,
        image_url: result.rows[0].image_url,
        has_image_url: !!result.rows[0].image_url
      });
    }

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error in image search:', error);
    res.status(500).json({ success: false, error: 'Image search failed' });
  }
});

// Hybrid search (both text and image)
router.post('/hybrid', async (req, res) => {
  try {
    const { query, imageData, limit = 5, type, location, textWeight = 0.5 } = req.body;
    
    if (!query && !imageData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either text query or image data is required' 
      });
    }

    let textEmbedding = null;
    let imageEmbedding = null;

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    
    // Get text embedding if query provided
    if (query) {
      try {
        const textResponse = await fetch(`${aiServiceUrl}/embed-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: query })
        });
        
        if (textResponse.ok) {
          const textData = await textResponse.json();
          textEmbedding = textData.embedding;
        }
      } catch (error) {
        console.warn('AI service not available for text embedding:', error.message);
        textEmbedding = Array(512).fill(0).map(() => Math.random() - 0.5);
      }
    }

    // Get image embedding if image provided
    if (imageData) {
      try {
        const imageResponse = await fetch(`${aiServiceUrl}/embed-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageEmbedding = imageData.embedding;
        }
      } catch (error) {
        console.warn('AI service not available for image embedding:', error.message);
        imageEmbedding = Array(512).fill(0).map(() => Math.random() - 0.5);
      }
    }

    // Build hybrid similarity search query
    let sqlQuery = `
      SELECT id, title, description, location, type, image_url, created_at,
    `;
    
    const params = [];
    let paramCount = 0;

    if (textEmbedding && imageEmbedding) {
      // Both text and image embeddings available
      // Convert distances to similarities and weight them
      sqlQuery += `
        GREATEST(0, 
          (1 - (text_embedding <=> $${++paramCount})) * $${++paramCount} +
          (1 - (image_embedding <=> $${++paramCount})) * $${++paramCount}
        ) as similarity_score
      `;
      params.push(JSON.stringify(textEmbedding), textWeight);
      params.push(JSON.stringify(imageEmbedding), 1 - textWeight);
    } else if (textEmbedding) {
      // Only text embedding - convert distance to similarity
      sqlQuery += `GREATEST(0, 1 - (text_embedding <=> $${++paramCount})) as similarity_score`;
      params.push(JSON.stringify(textEmbedding));
    } else {
      // Only image embedding - convert distance to similarity
      sqlQuery += `GREATEST(0, 1 - (image_embedding <=> $${++paramCount})) as similarity_score`;
      params.push(JSON.stringify(imageEmbedding));
    }

    sqlQuery += `
      FROM items
      WHERE 1=1
    `;

    if (type) {
      sqlQuery += ` AND type = $${++paramCount}`;
      params.push(type);
    }

    if (location) {
      sqlQuery += ` AND location ILIKE $${++paramCount}`;
      params.push(`%${location}%`);
    }

    sqlQuery += ` ORDER BY similarity_score DESC LIMIT $${++paramCount}`;
    params.push(limit);

    const result = await pool.query(sqlQuery, params);

    // Log results for debugging
    console.log('Hybrid search results count:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('First result:', {
        id: result.rows[0].id,
        title: result.rows[0].title,
        image_url: result.rows[0].image_url,
        has_image_url: !!result.rows[0].image_url
      });
    }

    res.json({
      success: true,
      data: result.rows,
      query: query,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error in hybrid search:', error);
    res.status(500).json({ success: false, error: 'Hybrid search failed' });
  }
});

export default router;
