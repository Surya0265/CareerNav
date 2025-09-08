const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { getJobsForExtractedSkills } = require('../controllers/jobController');

// New route for job search using extracted skills from Python backend
router.post('/jobs-by-resume', upload.single('resume'), getJobsForExtractedSkills);

module.exports = router;
