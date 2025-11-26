import express from 'express';
import multer from 'multer';
import { supabase } from '../utils/database.js';
import { pool } from '../utils/database.js';

const router = express.Router();

// Campus options
const CAMPUS_OPTIONS = ['Uniworld 1', 'Uniworld 2', 'SST Campus'];

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image to Supabase storage
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const { title, description, location, campus = 'Uniworld 1', type, contactInfo } = req.body;
    
    if (!title || !description || !location || !type || !contactInfo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, description, location, type, and contact information are required' 
      });
    }

    // Validate campus
    if (!CAMPUS_OPTIONS.includes(campus)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid campus. Must be one of: ${CAMPUS_OPTIONS.join(', ')}` 
      });
    }

    // Generate unique filename
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `lost-found/${fileName}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lost-found-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lost-found-images')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // Get image embedding from AI service
    const imageBase64 = req.file.buffer.toString('base64');
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    let imageEmbedding = null;
    let textEmbedding = null;

    try {
      const aiResponse = await fetch(`${aiServiceUrl}/embed-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        imageEmbedding = aiData.embedding;
      }
    } catch (error) {
      console.warn('AI service not available for image embedding:', error.message);
      imageEmbedding = Array(512).fill(0).map(() => Math.random() - 0.5);
    }

    // Get text embedding for description
    try {
      const textResponse = await fetch(`${aiServiceUrl}/embed-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${title} ${description}` })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        textEmbedding = textData.embedding;
      }
    } catch (error) {
      console.warn('AI service not available for text embedding:', error.message);
      textEmbedding = Array(512).fill(0).map(() => Math.random() - 0.5);
    }

    // Convert embeddings to PostgreSQL vector format
    const imageVector = imageEmbedding ? `[${imageEmbedding.join(',')}]` : `[${Array(512).fill(0).join(',')}]`;
    const textVector = textEmbedding ? `[${textEmbedding.join(',')}]` : `[${Array(512).fill(0).join(',')}]`;

    // Save to database with campus
    const result = await pool.query(
      `INSERT INTO items (title, description, location, campus, type, image_url, image_embedding, text_embedding, contact_info, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8::vector, $9, 'active')
       RETURNING *`,
      [title, description, location, campus, type, imageUrl, imageVector, textVector, contactInfo]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Item uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files provided' });
    }

    const { title, description, location, campus = 'Uniworld 1', type, contactInfo } = req.body;
    
    if (!title || !description || !location || !type || !contactInfo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, description, location, type, and contact information are required' 
      });
    }

    // Validate campus
    if (!CAMPUS_OPTIONS.includes(campus)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid campus. Must be one of: ${CAMPUS_OPTIONS.join(', ')}` 
      });
    }

    const uploadResults = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Generate unique filename
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `lost-found/${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lost-found-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error(`Error uploading file ${i}:`, uploadError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('lost-found-images')
        .getPublicUrl(filePath);

      uploadResults.push({
        fileName: file.originalname,
        url: urlData.publicUrl,
        path: filePath
      });
    }

    if (uploadResults.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to upload any images' 
      });
    }

    // Use first image for embeddings
    const primaryImage = uploadResults[0];
    const imageBase64 = req.files[0].buffer.toString('base64');

    // Get embeddings
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    let imageEmbedding = null;
    let textEmbedding = null;

    try {
      const [imageResponse, textResponse] = await Promise.all([
        fetch(`${aiServiceUrl}/embed-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 })
        }),
        fetch(`${aiServiceUrl}/embed-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `${title} ${description}` })
        })
      ]);

      if (imageResponse.ok) {
        const aiData = await imageResponse.json();
        imageEmbedding = aiData.embedding;
      }

      if (textResponse.ok) {
        const textData = await textResponse.json();
        textEmbedding = textData.embedding;
      }
    } catch (error) {
      console.warn('AI service not available, using mock embeddings:', error.message);
      imageEmbedding = Array(512).fill(0).map(() => Math.random() - 0.5);
      textEmbedding = Array(512).fill(0).map(() => Math.random() - 0.5);
    }

    // Convert embeddings to PostgreSQL vector format
    const imageVector = imageEmbedding ? `[${imageEmbedding.join(',')}]` : `[${Array(512).fill(0).join(',')}]`;
    const textVector = textEmbedding ? `[${textEmbedding.join(',')}]` : `[${Array(512).fill(0).join(',')}]`;

    // Save to database with primary image URL and campus
    const result = await pool.query(
      `INSERT INTO items (title, description, location, campus, type, image_url, image_embedding, text_embedding, contact_info, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8::vector, $9, 'active')
       RETURNING *`,
      [title, description, location, campus, type, primaryImage.url, imageVector, textVector, contactInfo]
    );

    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
        additionalImages: uploadResults.slice(1)
      },
      message: 'Items uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
});

export default router;
