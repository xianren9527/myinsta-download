require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting - 20 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many download requests from this IP, please try again after an hour.'
});

// Apply rate limiting to download routes only
app.use('/api/download', limiter);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Instagram content download API
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.includes('instagram.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Instagram URL' 
      });
    }
    
    // Clean up the URL
    const cleanUrl = url.split('?')[0];
    
    console.log(`Processing request for URL: ${cleanUrl}`);
    
    // Fetch the Instagram page
    const response = await axios.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract data
    let mediaData = [];
    let postCaption = '';
    let username = '';
    
    // Try to extract data using various methods (Instagram changes their structure often)
    
    // Method 1: Look for JSON data in script tags
    const scriptTags = $('script[type="application/ld+json"]');
    
    if (scriptTags.length > 0) {
      for (let i = 0; i < scriptTags.length; i++) {
        try {
          const jsonData = JSON.parse($(scriptTags[i]).html());
          
          if (jsonData && jsonData.author) {
            username = jsonData.author.identifier?.value || jsonData.author.alternateName || '';
          }
          
          if (jsonData && jsonData.caption) {
            postCaption = jsonData.caption;
          }
          
          // Check for image URLs
          if (jsonData && jsonData.image) {
            if (Array.isArray(jsonData.image)) {
              jsonData.image.forEach(img => {
                if (typeof img === 'string') {
                  mediaData.push({
                    type: 'image',
                    url: img
                  });
                } else if (img.url) {
                  mediaData.push({
                    type: 'image',
                    url: img.url
                  });
                }
              });
            } else if (typeof jsonData.image === 'string') {
              mediaData.push({
                type: 'image',
                url: jsonData.image
              });
            } else if (jsonData.image && jsonData.image.url) {
              mediaData.push({
                type: 'image',
                url: jsonData.image.url
              });
            }
          }
          
          // Check for video URLs
          if (jsonData && jsonData.video) {
            if (Array.isArray(jsonData.video)) {
              jsonData.video.forEach(vid => {
                if (vid.contentUrl) {
                  mediaData.push({
                    type: 'video',
                    url: vid.contentUrl,
                    thumbnail: vid.thumbnailUrl || ''
                  });
                }
              });
            } else if (jsonData.video && jsonData.video.contentUrl) {
              mediaData.push({
                type: 'video',
                url: jsonData.video.contentUrl,
                thumbnail: jsonData.video.thumbnailUrl || ''
              });
            }
          }
        } catch (e) {
          console.error('Error parsing JSON from script tag:', e);
        }
      }
    }
    
    // Method 2: Look for meta tags
    if (mediaData.length === 0) {
      const ogImage = $('meta[property="og:image"]').attr('content');
      const ogVideo = $('meta[property="og:video"]').attr('content');
      const ogVideoSecureUrl = $('meta[property="og:video:secure_url"]').attr('content');
      const ogTitle = $('meta[property="og:title"]').attr('content');
      
      if (ogImage) {
        mediaData.push({
          type: 'image',
          url: ogImage
        });
      }
      
      if (ogVideo || ogVideoSecureUrl) {
        mediaData.push({
          type: 'video',
          url: ogVideoSecureUrl || ogVideo,
          thumbnail: ogImage || ''
        });
      }
      
      if (ogTitle && !postCaption) {
        postCaption = ogTitle;
      }
      
      if (!username) {
        // Try to extract username from URL or title
        const urlMatch = url.match(/instagram\.com\/([^\/]+)/);
        if (urlMatch && urlMatch[1]) {
          username = urlMatch[1];
          // Remove any trailing part
          username = username.split('/')[0];
        }
      }
    }
    
    // Method 3: Look for content in specific Instagram structures
    if (mediaData.length === 0) {
      const imageNodes = $('img[srcset]');
      imageNodes.each(function() {
        const srcset = $(this).attr('srcset');
        if (srcset) {
          const sources = srcset.split(',');
          const lastSource = sources[sources.length - 1].trim().split(' ')[0];
          
          if (lastSource && !mediaData.some(m => m.url === lastSource)) {
            mediaData.push({
              type: 'image',
              url: lastSource
            });
          }
        }
      });
      
      const videoNodes = $('video source');
      videoNodes.each(function() {
        const videoUrl = $(this).attr('src');
        if (videoUrl && !mediaData.some(m => m.url === videoUrl)) {
          mediaData.push({
            type: 'video',
            url: videoUrl,
            thumbnail: ''
          });
        }
      });
    }
    
    // Fallback if no data was found
    if (mediaData.length === 0) {
      // If we couldn't extract data, provide a fallback with simulated content
      console.log('Could not extract media from Instagram URL. Using fallback data.');
      
      // Determine if it's a video based on URL
      const isVideo = url.includes('/reel/') || url.toLowerCase().includes('video');
      
      if (isVideo) {
        mediaData.push({
          type: 'video',
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: 'https://source.unsplash.com/random/1080x1080/?instagram'
        });
      } else {
        mediaData.push({
          type: 'image',
          url: 'https://source.unsplash.com/random/1080x1080/?instagram'
        });
      }
      
      // Add a note in the caption
      if (!postCaption) {
        postCaption = '⚠️ Could not extract content from this Instagram post. Showing sample content instead.';
      } else {
        postCaption += ' ⚠️ (Actual content could not be extracted)';
      }
    }
    
    // Send the data back to the client
    return res.json({
      success: true,
      data: {
        media: mediaData,
        caption: postCaption,
        username: username
      }
    });
    
  } catch (error) {
    console.error('Error processing Instagram URL:', error);
    
    // Check specific error cases
    if (error.response) {
      // Instagram returned a non-200 response
      if (error.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Instagram post not found. It may have been deleted or is private.'
        });
      }
      
      if (error.response.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests to Instagram. Please try again later.'
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process Instagram content. Please try again later.'
    });
  }
});

// Fallback route - serve the static HTML file
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
