const axios = require('axios');
const fetch = require('node-fetch');

/**
 * Extract media from Instagram URL
 * @param {string} url - Instagram URL to extract content from
 * @returns {Object|null} - Extracted media data or null if extraction failed
 */
async function extractMediaFromInstagram(url) {
  try {
    // Clean the URL first
    const cleanUrl = url.split('?')[0];
    
    // We'll use two different approaches to maximize success rate
    try {
      // Method 1: Use a more reliable but indirect approach
      return await extractMediaUsingRapidAPI(cleanUrl);
    } catch (error) {
      console.log('First method failed, trying alternative method');
      // Method 2: Direct parsing approach (fallback)
      return await extractMediaByDirectParsing(cleanUrl);
    }
  } catch (error) {
    console.error('Failed to extract media:', error);
    return null;
  }
}

/**
 * Extract media using RapidAPI (or similar service)
 * In a production environment, you would use a paid service like RapidAPI's Instagram downloader
 * Here we'll simulate the response for demo purposes
 * @param {string} url - Instagram URL
 * @returns {Object} - Media data
 */
async function extractMediaUsingRapidAPI(url) {
  // This is a simplified version. In production, you would:
  // 1. Sign up for a service like RapidAPI's Instagram downloader
  // 2. Make an actual API call to their endpoint
  
  // For simplicity in this demo, we'll use a direct approach
  return extractMediaByDirectParsing(url);
}

/**
 * Extract media by directly parsing the Instagram page
 * This is a fallback method that might break if Instagram changes their structure
 * @param {string} url - Instagram URL
 * @returns {Object} - Media data
 */
async function extractMediaByDirectParsing(url) {
  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Extract the JSON data embedded in the page
    const jsonData = extractJsonFromHtml(html);
    
    if (!jsonData) {
      throw new Error('Could not extract data from Instagram page');
    }
    
    // Process and return the media data
    return processInstagramData(jsonData, url);
  } catch (error) {
    console.error('Error in direct parsing:', error);
    throw error;
  }
}

/**
 * Extract JSON data from Instagram HTML
 * @param {string} html - HTML content
 * @returns {Object|null} - Extracted JSON data or null
 */
function extractJsonFromHtml(html) {
  try {
    // Look for the script tag with the shared_data variable
    const dataRegex = /<script type="text\/javascript">window\._sharedData = (.+?);<\/script>/;
    const matches = html.match(dataRegex);
    
    if (matches && matches.length > 1) {
      return JSON.parse(matches[1]);
    }
    
    // Alternative: Look for additional data in other script tags
    const altRegex = /<script type="application\/ld\+json">(.*?)<\/script>/;
    const altMatches = html.match(altRegex);
    
    if (altMatches && altMatches.length > 1) {
      return JSON.parse(altMatches[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return null;
  }
}

/**
 * Process Instagram data and extract media URLs
 * @param {Object} jsonData - Extracted JSON data
 * @param {string} originalUrl - Original Instagram URL
 * @returns {Object} - Processed media data
 */
function processInstagramData(jsonData, originalUrl) {
  // This function would extract the media URLs from the parsed JSON
  // For simplicity in this demo, we'll return a placeholder response
  
  // Determine if it's a post, reel, or story based on the URL
  const type = getContentType(originalUrl);
  
  // In a real implementation, you would extract the actual media URLs
  // from the JSON data based on the content type
  
  // For demonstration purposes, we'll return dummy data
  return {
    type,
    url: originalUrl,
    // Placeholder data - in a real implementation, extract these from the JSON
    media: [
      {
        type: type === 'reel' ? 'video' : 'image',
        url: type === 'reel' 
          ? 'https://example.com/sample-reel.mp4' 
          : 'https://example.com/sample-image.jpg',
        thumbnail: 'https://example.com/thumbnail.jpg'
      }
    ],
    // Additional metadata that would be extracted from the JSON
    metadata: {
      username: 'instagram_user',
      caption: 'This is a sample caption',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Determine the content type from the URL
 * @param {string} url - Instagram URL
 * @returns {string} - Content type (post, reel, or story)
 */
function getContentType(url) {
  if (url.includes('/p/')) return 'post';
  if (url.includes('/reel/')) return 'reel';
  if (url.includes('/stories/')) return 'story';
  return 'unknown';
}

module.exports = {
  extractMediaFromInstagram
}; 