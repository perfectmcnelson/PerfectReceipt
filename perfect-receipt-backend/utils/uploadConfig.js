
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// --------------------
// Cloudinary config
// --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------
// Shared image filter
// --------------------
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

// --------------------
// Profile picture upload (memory)
// --------------------
const uploadProfileImg = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB input
  },
  fileFilter: imageFilter,
});

// --------------------
// Business logo upload (memory)
// --------------------
const uploadBizLogo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // allow large input, compress later
  },
  fileFilter: imageFilter,
});

module.exports = {
  uploadProfileImg,
  uploadBizLogo,
  cloudinary,
};

