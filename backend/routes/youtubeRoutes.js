const express = require('express');
const router = express.Router();
const { generateYouTubeRecommendations } = require('../controllers/youtubeController');
const { getYouTubeRecommendationsHistory } = require('../controllers/youtubeController');
const { protect } = require('../middleware/authMiddleware');

// Route to generate YouTube recommendations (supports both authenticated and non-authenticated requests)
router.post('/recommendations', protect, generateYouTubeRecommendations);

// Alias route for backward compatibility
router.post('/', protect, generateYouTubeRecommendations);

// History (authenticated)
router.get('/history', protect, getYouTubeRecommendationsHistory);

module.exports = router;
