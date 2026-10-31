const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure public/images directory exists on disk
const uploadDir = path.join(process.cwd(), "public", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    // Sanitize original file name to be web safe
    const parsedName = path.parse(file.originalname).name;
    const cleanName = parsedName.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}-${cleanName}${ext}`);
  },
});

const uploader = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const supportedImage = /png|jpg|jpeg|webp|gif|svg/;
    const extension = path.extname(file.originalname).toLowerCase().replace(".", "");
    const isExtValid = supportedImage.test(extension);
    const isMimeValid = file.mimetype && file.mimetype.startsWith("image/");

    if (isExtValid && isMimeValid) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (png, jpg, jpeg, webp, gif, svg) are allowed!"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = uploader;