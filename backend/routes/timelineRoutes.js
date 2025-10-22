const express = require('express');
const router = express.Router();
const { generateCareerTimeline, generateCareerPlan, getTimelineHistory, markPhaseComplete } = require('../controllers/timelineController');
const { protect } = require('../middleware/authMiddleware');

// Route to generate career timeline (supports both authenticated and non-authenticated requests)
router.post('/generate-timeline', protect, generateCareerTimeline);

// Route to get timeline/YouTube recommendations (with optional auth)
// This can be called with or without authentication
router.post('/', protect, generateCareerTimeline);

// Route to generate career plan with Mermaid flowchart
router.post('/generate-plan', generateCareerPlan);

// Get timeline history (authenticated)
router.get('/history', protect, getTimelineHistory);

// Mark a phase completed (authenticated)
router.post('/complete-phase', protect, markPhaseComplete);

// Get a single timeline plan by id
router.get('/:id', protect, require('../controllers/timelineController').getTimelineById);

// Re-generate an existing plan (populate phases/mermaid) — owner only
router.post('/:id/regenerate', protect, require('../controllers/timelineController').regeneratePlan);

module.exports = router;
