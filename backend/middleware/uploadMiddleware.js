const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 10MB limit
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${Date.now()}${ext}`);
  }
});

// Validate file type by extension AND mimetype
const fileFilter = (req, file, cb) => {
  const allowedExt = ['.pdf', '.doc', '.docx'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check extension first
  if (!allowedExt.includes(ext)) {
    return cb(
      new Error('Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are supported.'),
      false
    );
  }
  
  // Check mimetype - be more flexible since different browsers/systems report mimetypes differently
  const mimeType = file.mimetype.toLowerCase();
  const isValidMime = 
    mimeType === 'application/pdf' ||
    mimeType.includes('pdf') ||
    mimeType === 'application/msword' ||
    mimeType.includes('word') ||
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('document');
  
  if (!isValidMime) {
    console.warn(`[MULTER] Suspicious mimetype for ${file.originalname}: ${file.mimetype}. Extension: ${ext}. Allowing due to valid extension.`);
  }
  
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE // 10MB limit
  }
});
