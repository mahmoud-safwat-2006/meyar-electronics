const Brand = require("../model/Brand");
const Category = require("../model/Category");
const Product = require("../model/Products");

// create product service
exports.createProductService = async (data) => {
  const product = await Product.create(data);
  const { _id: productId, brand, category } = product;

  // update Brand if provided
  if (brand && brand.id) {
    await Brand.updateOne(
      { _id: brand.id },
      { $push: { products: productId } }
    ).catch((err) => console.error("Brand relation error:", err.message));
  }

  // update Category if provided
  if (category && category.id) {
    await Category.updateOne(
      { _id: category.id },
      { $push: { products: productId } }
    ).catch((err) => console.error("Category relation error:", err.message));
  }

  return product;
};

// create all product service (Bulk Insert)
exports.addAllProductService = async (data) => {
  // Safe insert without wiping existing inventory
  const products = await Product.insertMany(data);

  for (const product of products) {
    if (product.brand && product.brand.id) {
      await Brand.findByIdAndUpdate(product.brand.id, {
        $addToSet: { products: product._id },
      }).catch((err) => console.error("Brand bulk update error:", err.message));
    }
    if (product.category && product.category.id) {
      await Category.findByIdAndUpdate(product.category.id, {
        $addToSet: { products: product._id },
      }).catch((err) => console.error("Category bulk update error:", err.message));
    }
  }

  return products;
};

// get all products
exports.getAllProductsService = async () => {
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .populate("reviews");
  return products;
};

// get type of product service
exports.getProductTypeService = async (req) => {
  const type = req.params.type;
  const query = req.query || {};
  let products;

  if (query.new === "true") {
    products = await Product.find({ productType: type })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("reviews");
  } else if (query.featured === "true") {
    products = await Product.find({
      productType: type,
      featured: true,
    }).populate("reviews");
  } else if (query.topSellers === "true") {
    products = await Product.find({ productType: type })
      .sort({ sellCount: -1 })
      .limit(8)
      .populate("reviews");
  } else {
    products = await Product.find({ productType: type }).populate("reviews");
  }

  return products;
};

// get offer product service
exports.getOfferTimerProductService = async (query) => {
  const products = await Product.find({
    productType: query,
    "offerDate.endDate": { $gt: new Date() },
  }).populate("reviews");
  return products;
};

// get popular product service by type
exports.getPopularProductServiceByType = async (type) => {
  const products = await Product.find({ productType: type })
    .sort({ "reviews.length": -1 })
    .limit(8)
    .populate("reviews");
  return products;
};

// get top rated products
exports.getTopRatedProductService = async () => {
  const products = await Product.find({
    reviews: { $exists: true, $ne: [] },
  }).populate("reviews");

  const topRatedProducts = products.map((product) => {
    const totalRating = (product.reviews || []).reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    const averageRating =
      product.reviews && product.reviews.length > 0
        ? totalRating / product.reviews.length
        : 0;

    return {
      ...product.toObject(),
      rating: averageRating,
    };
  });

  topRatedProducts.sort((a, b) => b.rating - a.rating);
  return topRatedProducts;
};

// get single product service
exports.getProductService = async (id) => {
  if (!id) return null;

  try {
    const product = await Product.findById(id).populate({
      path: "reviews",
      populate: { path: "userId", select: "name email imageURL" },
    });
    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message);
    throw error;
  }
};

// get related products safely
exports.getRelatedProductService = async (productId) => {
  const currentProduct = await Product.findById(productId);

  if (!currentProduct || !currentProduct.category || !currentProduct.category.name) {
    return [];
  }

  const relatedProducts = await Product.find({
    "category.name": currentProduct.category.name,
    _id: { $ne: productId },
  }).limit(8);

  return relatedProducts;
};

// update product safely
exports.updateProductService = async (id, currProduct) => {
  const product = await Product.findById(id);
  if (!product) return null;

  // Safe field assignments
  if (currProduct.title !== undefined) product.title = currProduct.title;
  if (currProduct.sku !== undefined) product.sku = currProduct.sku;
  if (currProduct.img !== undefined) product.img = currProduct.img;
  if (currProduct.slug !== undefined) product.slug = currProduct.slug;
  if (currProduct.unit !== undefined) product.unit = currProduct.unit;
  if (currProduct.imageURLs !== undefined) product.imageURLs = currProduct.imageURLs;
  if (currProduct.tags !== undefined) product.tags = currProduct.tags;
  if (currProduct.sizes !== undefined) product.sizes = currProduct.sizes;
  if (currProduct.featured !== undefined) product.featured = Boolean(currProduct.featured);
  if (currProduct.parent !== undefined) product.parent = currProduct.parent;
  if (currProduct.children !== undefined) product.children = currProduct.children;
  if (currProduct.price !== undefined) product.price = Number(currProduct.price);
  if (currProduct.discount !== undefined) product.discount = Number(currProduct.discount);
  if (currProduct.quantity !== undefined) product.quantity = Number(currProduct.quantity);
  if (currProduct.status !== undefined) product.status = currProduct.status;
  if (currProduct.productType !== undefined) product.productType = currProduct.productType;
  if (currProduct.description !== undefined) product.description = currProduct.description;
  if (currProduct.additionalInformation !== undefined) {
    product.additionalInformation = currProduct.additionalInformation;
  }

  // Handle Brand update
  if (currProduct.brand) {
    product.brand = {
      name: currProduct.brand.name || product.brand?.name || "",
      id: currProduct.brand.id || product.brand?.id || null,
    };
  }

  // Handle Category update
  if (currProduct.category) {
    product.category = {
      name: currProduct.category.name || product.category?.name || "",
      id: currProduct.category.id || product.category?.id || null,
    };
  }

  // Handle offerDate safely
  if (currProduct.offerDate) {
    product.offerDate = {
      startDate: currProduct.offerDate.startDate || product.offerDate?.startDate,
      endDate: currProduct.offerDate.endDate || product.offerDate?.endDate,
    };
  }

  await product.save();
  return product;
};

// get reviews products
exports.getReviewsProducts = async () => {
  const result = await Product.find({
    reviews: { $exists: true, $ne: [] },
  }).populate({
    path: "reviews",
    populate: { path: "userId", select: "name email imageURL" },
  });

  return (result || []).filter((p) => p.reviews && p.reviews.length > 0);
};

// get stock out products
exports.getStockOutProducts = async () => {
  const result = await Product.find({ status: "out-of-stock" }).sort({
    createdAt: -1,
  });
  return result;
};

// delete product and cleanup relations
exports.deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (product) {
    if (product.brand && product.brand.id) {
      await Brand.updateOne(
        { _id: product.brand.id },
        { $pull: { products: id } }
      ).catch(() => {});
    }
    if (product.category && product.category.id) {
      await Category.updateOne(
        { _id: product.category.id },
        { $pull: { products: id } }
      ).catch(() => {});
    }
  }
  return product;
};