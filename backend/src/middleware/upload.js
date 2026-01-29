const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// إعداد التخزين للـ avatar
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars", // فولدر خاص بالأفاتار في Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      return `avatar_${Date.now()}`; // اسم فريد لكل صورة
    },
  },
});

const upload = multer({ storage });

module.exports = upload;