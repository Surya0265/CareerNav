const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { handleResumeUpload } = require('../controllers/resumeController');

router.post('/upload', upload.single('resume'), handleResumeUpload);

module.exports = router;
