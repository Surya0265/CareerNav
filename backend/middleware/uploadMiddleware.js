const multer = require('multer');
const path = require('path');
const fs=require('fs')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true }); // Ensures folder exists
    cb(null, uploadDir);
    

  },

  filename: (req, file, cb) => {
  const ext = path.extname(file.originalname);
  cb(null, `resume-${Date.now()}${ext}`);
}
});



const fileFilter = (req, file, cb) => { 
  const allowed = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
};

module.exports = multer({ storage, fileFilter });
