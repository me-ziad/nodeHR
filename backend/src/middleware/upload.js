const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // نطلع من src → backend → api2 → ندخل uploads/avatars
    cb(null, path.join(__dirname, '../../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
module.exports = upload;