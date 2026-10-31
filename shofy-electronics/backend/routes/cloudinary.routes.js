const express = require("express");
const router = express.Router();
const multer = require("multer");
const { cloudinaryController } = require("../controller/cloudinary.controller");
const { isAuth, isAdmin } = require("../config/auth");

// Configure secure multer with file size limits and image-only filter
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Add single image (Authenticated user / Admin)
router.post(
  "/add-img",
  isAuth,
  upload.single("image"),
  cloudinaryController.saveImageCloudinary
);

// Add multiple images (Admin only)
router.post(
  "/add-multiple-img",
  isAuth,
  isAdmin,
  upload.array("images", 5),
  cloudinaryController.addMultipleImageCloudinary
);

// Delete image (Admin only)
router.delete(
  "/img-delete",
  isAuth,
  isAdmin,
  cloudinaryController.cloudinaryDeleteController
);

module.exports = router;