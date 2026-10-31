const fs = require("fs");
const { cloudinaryServices } = require("../services/cloudinary.service");

// Add single image to Cloudinary
const saveImageCloudinary = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const result = await cloudinaryServices.cloudinaryImageUpload(
      req.file.buffer
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.secure_url,
        id: result.public_id,
      },
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    next(err);
  }
};

// Add multiple images to Cloudinary
const addMultipleImageCloudinary = async (req, res, next) => {
  try {
    const files = req.files;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided for upload",
      });
    }

    // Array to store Cloudinary image upload responses
    const uploadResults = [];

    for (const file of files) {
      // Support both memory buffer and disk storage safely
      let imageBuffer = file.buffer;
      if (!imageBuffer && file.path && fs.existsSync(file.path)) {
        imageBuffer = fs.readFileSync(file.path);
      }

      if (!imageBuffer) continue;

      // Upload image to Cloudinary
      const result = await cloudinaryServices.cloudinaryImageUpload(imageBuffer);
      uploadResults.push(result);

      // Clean up temporary local disk file if it exists
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupErr) {
          console.warn("Could not delete temp file:", cleanupErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data:
        uploadResults.length > 0
          ? uploadResults.map((res) => ({
              url: res.secure_url,
              id: res.public_id,
            }))
          : [],
    });
  } catch (err) {
    console.error("Cloudinary multi-upload error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to upload images",
    });
  }
};

// Delete image from Cloudinary
const cloudinaryDeleteController = async (req, res, next) => {
  try {
    const { folder_name, id, public_id: directId } = req.query;

    const targetPublicId =
      directId ||
      (folder_name && id ? `${folder_name}/${id}` : id);

    if (!targetPublicId) {
      return res.status(400).json({
        success: false,
        message: "Image public_id or ID is required for deletion",
      });
    }

    const result = await cloudinaryServices.cloudinaryImageDelete(targetPublicId);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: result,
    });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete image",
    });
  }
};

exports.cloudinaryController = {
  cloudinaryDeleteController,
  saveImageCloudinary,
  addMultipleImageCloudinary,
};