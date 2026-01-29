const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Avatar storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: () => `avatar_${Date.now()}`,
  },
});

// CV storage
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cvs",
    allowed_formats: ["pdf", "doc", "docx"],
    public_id: () => `cv_${Date.now()}`,
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadCv = multer({ storage: cvStorage });

module.exports = { uploadAvatar, uploadCv };