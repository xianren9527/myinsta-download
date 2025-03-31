require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { downloadRouter } = require('./server/routes/download');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
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

// Routes
app.use('/api/download', downloadRouter);

// Root route - serve the static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route for Instagram content
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !url.includes('instagram.com')) {
      return res.status(400).json({ error: 'Invalid Instagram URL' });
    }
    
    // Here you would implement the actual Instagram scraping logic
    // This is a placeholder response
    const mockResponse = {
      success: true,
      data: {
        type: 'image',
        url: 'https://via.placeholder.com/1080x1080',
        caption: 'Instagram post caption would appear here',
        username: 'instagram_user'
      }
    };
    
    return res.json(mockResponse);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Fallback route - also serve the static HTML file
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong! Please try again later.'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 