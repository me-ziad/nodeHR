const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// إعداد Cloudinary من الـ env variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// إعداد التخزين على Cloudinary
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "projects", // اسم الفولدر على Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadProjectImages = multer({ storage: projectStorage });

module.exports = uploadProjectImages;