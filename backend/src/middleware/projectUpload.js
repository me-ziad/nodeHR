// backend/middleware/projectUpload.js
const multer = require('multer');
const path = require('path');

// Storage خاص بالمشاريع
const projectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads/projects')); // فولدر خاص بالمشاريع
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadProjectImages = multer({ storage: projectStorage });

module.exports = uploadProjectImages;