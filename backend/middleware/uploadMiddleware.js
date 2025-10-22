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
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check extension
  if (!allowedExt.includes(ext)) {
    return cb(
      new Error('Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are supported.'),
      false
    );
  }
  
  // Check mimetype
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error('File mimetype does not match the file extension. Please upload a valid PDF or Word document.'),
      false
    );
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
