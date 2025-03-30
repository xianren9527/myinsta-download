const express = require('express');
const { getInstagramContent } = require('../controllers/downloadController');

const router = express.Router();

// Route to download Instagram content
router.post('/', getInstagramContent);

module.exports = { downloadRouter: router }; 