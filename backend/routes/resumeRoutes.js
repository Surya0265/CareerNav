const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { handleResumeUpload } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// Resume upload - protected to associate with user
router.post('/upload', protect, upload.single('resume'), handleResumeUpload);

module.exports = router;
