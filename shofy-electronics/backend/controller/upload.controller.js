exports.fileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded or invalid file field name",
      });
    }

    // Format clean public URL for the uploaded image
    const filePath = `/images/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: filePath,
        url: filePath,
      },
    });
  } catch (error) {
    next(error);
  }
};