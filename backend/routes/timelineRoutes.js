const express = require('express');
const router = express.Router();
const { generateCareerTimeline, generateCareerPlan } = require('../controllers/timelineController');

// Route to generate career timeline
router.post('/generate-timeline', generateCareerTimeline);

// Route to generate career plan with Mermaid flowchart
router.post('/generate-plan', generateCareerPlan);

module.exports = router;
