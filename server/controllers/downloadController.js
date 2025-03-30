const axios = require('axios');
const { extractMediaFromInstagram } = require('../utils/instagramUtils');

/**
 * Controller to handle Instagram content download
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getInstagramContent(req, res) {
  try {
    const { url } = req.body;
    
    // Validate URL
    if (!url || !isValidInstagramURL(url)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Instagram URL'
      });
    }

    // Extract media data from Instagram
    const mediaData = await extractMediaFromInstagram(url);
    
    if (!mediaData) {
      return res.status(404).json({
        success: false,
        message: 'Failed to extract content from the provided URL'
      });
    }

    res.status(200).json({
      success: true,
      data: mediaData
    });
  } catch (error) {
    console.error('Error downloading Instagram content:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to download content. Please try again later.'
    });
  }
}

/**
 * Check if the URL is a valid Instagram URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function isValidInstagramURL(url) {
  // Simple validation for Instagram URLs
  const regex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[^/?#&]+/i;
  return regex.test(url);
}

module.exports = {
  getInstagramContent
}; 