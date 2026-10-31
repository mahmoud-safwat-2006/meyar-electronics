const mongoose = require("mongoose");
const productServices = require("../services/product.service");
const Product = require("../model/Products");

// add product
exports.addProduct = async (req, res, next) => {
  try {
    const { img, imageURLs, title, price } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({
        success: false,
        status: "fail",
        message: "Product title and price are required",
      });
    }

    const firstItem = {
      color: {
        name: "",
        clrCode: "",
      },
      img: img || "",
    };

    // Ensure imageURLs is a valid array
    const extraImages = Array.isArray(imageURLs) ? imageURLs : [];
    const formattedImages = img ? [firstItem, ...extraImages] : extraImages;

    const result = await productServices.createProductService({
      ...req.body,
      imageURLs: formattedImages,
    });

    return res.status(201).json({
      success: true,
      status: "success",
      message: "Product created successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// add all products (Bulk insert for Admin)
exports.addAllProducts = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of products",
      });
    }

    const result = await productServices.addAllProductService(req.body);
    return res.status(200).json({
      success: true,
      message: "Products added successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

// get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const result = await productServices.getAllProductsService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get all products by type
exports.getProductsByType = async (req, res, next) => {
  try {
    const result = await productServices.getProductTypeService(req);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get offer product controller
exports.getOfferTimerProducts = async (req, res, next) => {
  try {
    const result = await productServices.getOfferTimerProductService(req.query.type);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get Popular Product By Type
exports.getPopularProductByType = async (req, res, next) => {
  try {
    const result = await productServices.getPopularProductServiceByType(req.params.type);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// get top rated Products
exports.getTopRatedProducts = async (req, res, next) => {
  try {
    const result = await productServices.getTopRatedProductService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// getSingleProduct
exports.getSingleProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate({
      path: "reviews",
      populate: { path: "userId", select: "name email imageURL" },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// get Related Product
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        data: [],
      });
    }

    const products = await productServices.getRelatedProductService(id);
    return res.status(200).json({
      success: true,
      data: products || [],
    });
  } catch (error) {
    next(error);
  }
};

// update product
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productServices.updateProductService(id, req.body);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found to update",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: "Product updated successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// review products
exports.reviewProducts = async (req, res, next) => {
  try {
    const products = await productServices.getReviewsProducts();
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// stock out products
exports.stockOutProducts = async (req, res, next) => {
  try {
    const products = await productServices.getStockOutProducts();
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const deletedProduct = await productServices.deleteProduct(id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};