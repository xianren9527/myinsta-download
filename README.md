# MyInsta Download

A modern web application that allows users to download Instagram content (photos, videos, reels, and stories) with a simple, user-friendly interface.

## Features

- **Simple Interface**: Paste an Instagram link and download with one click
- **Multiple Content Types**: Support for Photos, Videos, Reels, and Stories
- **No Login Required**: Use without an Instagram account
- **Instant Download**: No redirects or waiting
- **Mobile-Friendly**: Works on all devices
- **Preview Content**: See what you're downloading before saving it
- **Dark Theme**: Easy on the eyes with a sleek dark design

## Tech Stack

- **Frontend**: HTML, CSS (with Tailwind CSS), JavaScript
- **Backend**: Node.js with Express
- **Instagram API**: Custom implementation using instagram-private-api
- **Rate Limiting**: Prevents abuse with express-rate-limit
- **Security**: Helmet for HTTP header security

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/myinsta-download.git
   cd myinsta-download
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file in the root directory:
   ```
   PORT=3000
   NODE_ENV=development
   # Add your Instagram credentials if needed for private-api
   IG_USERNAME=your_instagram_username
   IG_PASSWORD=your_instagram_password
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. For production:
   ```
   npm start
   ```

### Quick Start (Windows)

For Windows users, you can simply run the included batch file:

1. Double-click on `start.bat`
2. The script will install dependencies and start the server automatically
3. Access the application at http://localhost:3000

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Paste an Instagram post, reel, or story URL in the input field
3. Click "Download" to fetch the content
4. Preview the content and click the download button to save it to your device

## Legal Notice

This tool is intended for personal use only. You should only download content that you have the rights to download. Please respect copyright laws and Instagram's Terms of Service.

## License

MIT License

## Disclaimer

This project is not affiliated with, authorized, maintained, sponsored, or endorsed by Instagram or any of its affiliates or subsidiaries. This is an independent project that uses Instagram's public content for educational purposes.

The use of this tool is at your own risk. The developers are not responsible for any misuse or legal issues that may arise from using this tool. 