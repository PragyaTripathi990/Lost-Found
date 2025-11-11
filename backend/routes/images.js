import express from 'express';

const router = express.Router();

// Proxy endpoint to serve images from Supabase (bypasses CORS)
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'Image URL is required' });
    }

    // Validate that the URL is from Supabase (security check)
    if (!url.includes('supabase.co') && !url.includes('supabase')) {
      return res.status(400).json({ success: false, error: 'Invalid image source' });
    }

    // Fetch the image from Supabase
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!imageResponse.ok) {
      console.error('Failed to fetch image from Supabase:', imageResponse.status, url);
      return res.status(imageResponse.status).json({ 
        success: false, 
        error: 'Failed to fetch image' 
      });
    }

    // Get the content type from the response
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Get the image data as array buffer and convert to buffer
    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to proxy image',
      details: error.message 
    });
  }
});

export default router;

