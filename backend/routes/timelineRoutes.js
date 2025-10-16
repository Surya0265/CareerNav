const express = require('express');
const router = express.Router();
const { generateCareerTimeline, generateCareerPlan } = require('../controllers/timelineController');
const { protect } = require('../middleware/authMiddleware');

// Route to generate career timeline (supports both authenticated and non-authenticated requests)
router.post('/generate-timeline', generateCareerTimeline);

// Route to get timeline/YouTube recommendations (with optional auth)
// This can be called with or without authentication
router.post('/', generateCareerTimeline);

// Route to generate career plan with Mermaid flowchart
router.post('/generate-plan', generateCareerPlan);

module.exports = router;
