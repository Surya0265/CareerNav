const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { 
  getJobsForExtractedSkills,
  getJobsByUploadedResume,
  getJobsByExistingSkills
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Upload new resume and get job recommendations
router.post('/jobs-by-resume', upload.single('resume'), getJobsByUploadedResume);

// Get jobs by existing skills (user must be authenticated)
router.post('/jobs-by-skills', protect, getJobsByExistingSkills);

// Legacy route
router.post('/jobs-search', upload.single('resume'), getJobsForExtractedSkills);

module.exports = router;
