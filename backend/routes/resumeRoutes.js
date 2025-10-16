const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { handleResumeUpload, getLatestResume, finalizeResume, deleteResume, cleanupOldResumes } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

// Resume upload - protected to associate with user
router.post('/upload', protect, upload.single('resume'), handleResumeUpload);
router.get('/latest', protect, getLatestResume);
router.post('/finalize', protect, finalizeResume);
router.delete('/', protect, deleteResume);
router.post('/cleanup', protect, cleanupOldResumes);

module.exports = router;
