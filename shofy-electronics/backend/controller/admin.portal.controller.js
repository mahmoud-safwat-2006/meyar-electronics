const mongoose = require("mongoose");
const Admin = require("../model/Admin");
const AdminAuditLog = require("../model/AdminAuditLog");
const Brand = require("../model/Brand");
const Category = require("../model/Category");
const Coupon = require("../model/Coupon");
const Order = require("../model/Order");
const Product = require("../model/Products");
const Review = require("../model/Review");
const User = require("../model/User");
const productServices = require("../services/product.service");
const { secret } = require("../config/secret");

const COUPON_DEPARTMENTS = ["electronics", "fashion", "beauty", "jewelry", "home", "groceries"];
const roleOf = (req) => (req.user.role || "").toLowerCase();
const canViewFinance = (req) =>
  ["super admin", "ceo", "finance manager", "auditor", "admin"].includes(roleOf(req));

const safeCartItems = (cart) =>
  (cart || []).map((item) => ({
    title: item.title,
    sku: item.sku,
    img: item.img,
    productType: item.productType,
    orderQuantity: item.orderQuantity ?? item.quantity,
    color: item.color,
    size: item.size,
  }));

const getSystemStatus = (req, res) => {
  res.json({
    data: {
      api: "online",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      databaseName: mongoose.connection.readyState === 1 ? mongoose.connection.name : undefined,
      port: process.env.PORT || 7000,
      serverTime: new Date().toISOString(),
    },
  });
};

const getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 86400000);
    const previousWeekStart = new Date(now.getTime() - 14 * 86400000);
    const [
      orders,
      products,
      activeProducts,
      customers,
      newCustomers,
      lowStock,
      recentOrders,
      statusCounts,
      allTimeValue,
      weeklyValue,
      previousWeeklyValue,
      sectors,
      sectorSales,
    ] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        Product.countDocuments({ status: "in-stock" }),
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: weekStart } }),
        Product.countDocuments({ quantity: { $lte: 5 }, status: { $ne: "discontinued" } }),
        Order.find({})
          .sort({ createdAt: -1 })
          .limit(8)
          .select("invoice name contact cart status createdAt totalAmount"),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Order.aggregate([
          { $match: { status: { $nin: ["cancel", "returned"] } } },
          { $group: { _id: null, value: { $sum: "$totalAmount" } } },
        ]),
        Order.aggregate([
          { $match: { status: { $nin: ["cancel", "returned"] }, createdAt: { $gte: weekStart } } },
          { $group: { _id: null, value: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        ]),
        Order.aggregate([
          { $match: { status: { $nin: ["cancel", "returned"] }, createdAt: { $gte: previousWeekStart, $lt: weekStart } } },
          { $group: { _id: null, value: { $sum: "$totalAmount" } } },
        ]),
        Product.aggregate([{ $group: { _id: "$productType", count: { $sum: 1 } } }]),
        Order.aggregate([
          { $match: { status: { $nin: ["cancel", "returned"] } } },
          { $unwind: "$cart" },
          {
            $group: {
              _id: "$cart.productType",
              sales: {
                $sum: {
                  $multiply: [
                    { $ifNull: ["$cart.price", 0] },
                    { $ifNull: ["$cart.orderQuantity", { $ifNull: ["$cart.quantity", 1] }] },
                  ],
                },
              },
            },
          },
        ]),
      ]);

    const role = roleOf(req);
    const canSeeContact = [
      "super admin",
      "ceo",
      "admin",
      "logistics officer",
      "fulfillment lead",
      "support staff",
      "support agent",
    ].includes(role);
    const currentWeek = weeklyValue[0]?.value || 0;
    const previousWeek = previousWeeklyValue[0]?.value || 0;

    res.json({
      data: {
        orders,
        products,
        activeProducts,
        customers,
        newCustomers,
        lowStock,
        grossOrderValue: canViewFinance(req) ? allTimeValue[0]?.value || 0 : undefined,
        weeklyOrderValue: canViewFinance(req) ? currentWeek : undefined,
        weeklyGrowth: canViewFinance(req) && previousWeek
          ? ((currentWeek - previousWeek) / previousWeek) * 100
          : null,
        weeklyOrders: weeklyValue[0]?.count || 0,
        deliveredOrders: statusCounts.find((item) => item._id === "delivered")?.count || 0,
        sectors: sectors.map((sector) => {
          const type = String(sector._id || "").toLowerCase();
          const sales = sectorSales.find(
            (sale) => String(sale._id || "").toLowerCase() === type
          );
          return {
            type,
            count: sector.count,
            sales: sales?.sales || 0,
          };
        }),
        sectorSalesAvailable: sectorSales.some((sector) => sector._id),
        recentOrders: recentOrders.map((order) => {
          const item = order.toObject();
          if (!canViewFinance(req)) delete item.totalAmount;
          if (!canSeeContact) delete item.contact;
          item.sector = order.cart?.[0]?.productType || null;
          delete item.cart;
          return item;
        }),
        orderStatuses: statusCounts,
        serverTime: now.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      const search = String(req.query.search)
        .trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { "brand.name": { $regex: search, $options: "i" } },
      ];
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.parent = req.query.category;
    if (req.query.department) filter.productType = String(req.query.department).toLowerCase();
    if (req.query.stock === "low") filter.quantity = { $gt: 0, $lte: 5 };
    if (req.query.stock === "out") filter.quantity = 0;
    if (req.query.stock === "in") filter.quantity = { $gt: 5 };

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title sku img price discount quantity status parent children brand category productType createdAt updatedAt"),
      Product.countDocuments(filter),
    ]);

    res.json({
      data: {
        items: products,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { brand, category } = req.body;
    if (!brand || !mongoose.isValidObjectId(brand.id)) {
      return res.status(400).json({ message: "اختر علامة تجارية صالحة." });
    }
    if (!category || !mongoose.isValidObjectId(category.id)) {
      return res.status(400).json({ message: "اختر تصنيفًا صالحًا." });
    }

    const result = await productServices.createProductService(req.body);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "معرّف المنتج غير صالح." });
    }
    const product = await productServices.updateProductService(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود." });
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productServices.deleteProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود." });
    res.json({ message: "تم حذف المنتج بنجاح." });
  } catch (error) {
    next(error);
  }
};

const getProductOptions = async (req, res, next) => {
  try {
    const [categories, brands] = await Promise.all([
      Category.find({ status: "Show" }).select("parent productType children"),
      Brand.find({ status: "active" }).select("name"),
    ]);
    res.json({ data: { categories, brands } });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.invoice && /^\d+$/.test(String(req.query.invoice))) {
      filter.invoice = Number(req.query.invoice);
    }
    if (req.query.phone) {
      const phone = String(req.query.phone).trim().slice(0, 30);
      if (phone.length < 5) {
        return res.status(400).json({ message: "Invalid phone number." });
      }
      filter.contact = {
        $regex: phone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }
    if (req.query.city) {
      const city = String(req.query.city).trim().slice(0, 80);
      if (city) {
        filter.city = {
          $regex: city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        };
      }
    }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .select("invoice name email contact address city country zipCode cart subTotal shippingCost discount totalAmount paymentMethod status createdAt");

    const safeOrders = orders.map((order) => {
      const item = order.toObject();
      if (!canViewFinance(req)) {
        delete item.totalAmount;
        delete item.subTotal;
        delete item.shippingCost;
        delete item.discount;
      }
      if (["finance manager", "auditor"].includes(roleOf(req))) {
        delete item.name;
        delete item.email;
        delete item.contact;
        delete item.address;
        delete item.city;
        delete item.country;
        delete item.zipCode;
        delete item.cart;
      } else if (!canViewFinance(req)) {
        item.cart = safeCartItems(item.cart);
      }
      if (["support staff", "support agent"].includes(roleOf(req))) {
        delete item.address;
        delete item.city;
        delete item.country;
        delete item.zipCode;
        delete item.email;
      }
      if (["operations manager", "manager"].includes(roleOf(req))) {
        delete item.name;
        delete item.email;
        delete item.contact;
        delete item.address;
        delete item.city;
        delete item.country;
        delete item.zipCode;
      }
      return item;
    });
    res.json({ data: safeOrders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "returned", "cancel"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "حالة الطلب المحددة غير صالحة." });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).select("invoice status");
    if (!order) return res.status(404).json({ message: "الطلب غير موجود." });
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

const searchOrdersByPhone = async (req, res, next) => {
  try {
    const phone = String(req.query.phone || "").trim();
    if (phone.length < 5 || phone.length > 30) {
      return res.status(400).json({ message: "أدخل رقم هاتف صالحًا للبحث." });
    }
    const orders = await Order.find({
      contact: { $regex: phone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("invoice name contact cart status createdAt orderNote");
    res.json({
      data: orders.map((order) => {
        const item = order.toObject();
        item.cart = safeCartItems(item.cart);
        return item;
      }),
    });
  } catch (error) {
    next(error);
  }
};

const searchPortal = async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim().slice(0, 100);
    if (query.length < 2) return res.json({ data: [] });
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const [products, orders] = await Promise.all([
      Product.find({
        $or: [
          { title: { $regex: escaped, $options: "i" } },
          { sku: { $regex: escaped, $options: "i" } },
        ],
      }).limit(5).select("title sku productType"),
      /^\d+$/.test(query)
        ? Order.find({ invoice: Number(query) }).limit(5).select("invoice status")
        : Promise.resolve([]),
    ]);

    res.json({
      data: [
        ...products.map((product) => ({
          type: "product",
          id: product._id,
          label: product.title,
          detail: product.sku || product.productType,
        })),
        ...orders.map((order) => ({
          type: "order",
          id: order._id,
          label: `#${order.invoice}`,
          detail: order.status,
        })),
      ],
    });
  } catch (error) {
    next(error);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).limit(200);
    res.json({ data: coupons });
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const couponCode = String(req.body.couponCode || "").trim().toUpperCase();
    const title = String(req.body.title || "").trim();
    const logo = String(req.body.logo || "").trim();
    const productType = String(req.body.productType || "").trim().toLowerCase();
    const startTime = new Date(req.body.startTime || Date.now());
    const endTime = new Date(req.body.endTime);
    const discountPercentage = Number(req.body.discountPercentage);
    const minimumAmount = Number(req.body.minimumAmount);
    const status = req.body.status || "active";
    if (!title || !logo || !/^[A-Z0-9_-]{1,40}$/.test(couponCode)) {
      return res.status(400).json({ message: "أدخل اسمًا وشعارًا ورمز كوبون صالحًا." });
    }
    if (!COUPON_DEPARTMENTS.includes(productType)) {
      return res.status(400).json({ message: "اختر قطاعًا صالحًا للكوبون." });
    }
    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime()) ||
      endTime < startTime
    ) {
      return res.status(400).json({ message: "تحقق من تاريخ بداية الكوبون وانتهائه." });
    }
    if (!Number.isFinite(discountPercentage) || discountPercentage < 1 || discountPercentage > 100) {
      return res.status(400).json({ message: "يجب أن تكون نسبة الخصم بين 1 و100." });
    }
    if (!Number.isFinite(minimumAmount) || minimumAmount < 0) {
      return res.status(400).json({ message: "الحد الأدنى للطلب غير صالح." });
    }
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "حالة الكوبون غير صالحة." });
    }
    if (await Coupon.findOne({ couponCode })) {
      return res.status(409).json({ message: "رمز الكوبون مستخدم بالفعل." });
    }
    const coupon = await Coupon.create({
      title,
      logo,
      couponCode,
      startTime,
      endTime,
      discountPercentage,
      minimumAmount,
      productType,
      status,
    });
    res.status(201).json({ data: coupon });
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid coupon ID." });
    }
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "الكوبون غير موجود." });
    const updates = {};
    ["title", "couponCode", "startTime", "endTime", "discountPercentage", "minimumAmount", "productType", "logo", "status"].forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.title !== undefined) updates.title = String(updates.title).trim();
    if (updates.logo !== undefined) updates.logo = String(updates.logo).trim();
    if (updates.couponCode !== undefined) updates.couponCode = String(updates.couponCode).trim().toUpperCase();
    if (updates.productType !== undefined) updates.productType = String(updates.productType).trim().toLowerCase();
    if (updates.discountPercentage !== undefined) updates.discountPercentage = Number(updates.discountPercentage);
    if (updates.minimumAmount !== undefined) updates.minimumAmount = Number(updates.minimumAmount);
    if (updates.startTime !== undefined) updates.startTime = new Date(updates.startTime);
    if (updates.endTime !== undefined) updates.endTime = new Date(updates.endTime);
    const merged = {
      title: updates.title ?? coupon.title,
      logo: updates.logo ?? coupon.logo,
      couponCode: updates.couponCode ?? coupon.couponCode,
      productType: updates.productType ?? coupon.productType,
      startTime: updates.startTime ?? coupon.startTime ?? new Date(),
      endTime: updates.endTime ?? coupon.endTime,
      discountPercentage: updates.discountPercentage ?? coupon.discountPercentage,
      minimumAmount: updates.minimumAmount ?? coupon.minimumAmount,
      status: updates.status ?? coupon.status,
    };
    if (!merged.title || !merged.logo || !/^[A-Z0-9_-]{1,40}$/.test(merged.couponCode)) {
      return res.status(400).json({ message: "أدخل اسمًا وشعارًا ورمز كوبون صالحًا." });
    }
    if (!COUPON_DEPARTMENTS.includes(merged.productType)) {
      return res.status(400).json({ message: "اختر قطاعًا صالحًا للكوبون." });
    }
    if (
      Number.isNaN(new Date(merged.startTime).getTime()) ||
      Number.isNaN(new Date(merged.endTime).getTime()) ||
      new Date(merged.endTime) < new Date(merged.startTime)
    ) {
      return res.status(400).json({ message: "تحقق من تاريخ بداية الكوبون وانتهائه." });
    }
    if (!Number.isFinite(merged.discountPercentage) || merged.discountPercentage < 1 || merged.discountPercentage > 100) {
      return res.status(400).json({ message: "يجب أن تكون نسبة الخصم بين 1 و100." });
    }
    if (!Number.isFinite(merged.minimumAmount) || merged.minimumAmount < 0) {
      return res.status(400).json({ message: "الحد الأدنى للطلب غير صالح." });
    }
    if (!["active", "inactive"].includes(merged.status)) {
      return res.status(400).json({ message: "حالة الكوبون غير صالحة." });
    }
    if (updates.couponCode && updates.couponCode !== coupon.couponCode && await Coupon.findOne({ couponCode: updates.couponCode })) {
      return res.status(409).json({ message: "رمز الكوبون مستخدم بالفعل." });
    }
    Object.assign(coupon, updates);
    await coupon.save();
    res.json({ data: coupon });
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "الكوبون غير موجود." });
    res.json({ message: "تم حذف الكوبون." });
  } catch (error) {
    next(error);
  }
};

const getStaff = async (req, res, next) => {
  try {
    const staff = await Admin.find({}).select("-password -confirmationToken -confirmationTokenExpires").sort({ createdAt: -1 });
    res.json({ data: staff });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const staff = await Admin.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role,
    });
    res.status(201).json({
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const staff = await Admin.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "الموظف غير موجود." });
    ["name", "email", "phone", "role", "status"].forEach((key) => {
      if (req.body[key] !== undefined) staff[key] = req.body[key];
    });
    if (req.body.password) staff.password = req.body.password;
    await staff.save();
    res.json({
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "لا يمكنك حذف حسابك الحالي." });
    }
    const staff = await Admin.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "الموظف غير موجود." });
    res.json({ message: "تم حذف حساب الموظف." });
  } catch (error) {
    next(error);
  }
};

const getFinance = async (req, res, next) => {
  try {
    const [summary, daily] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $nin: ["cancel", "returned"] } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
            averageOrder: { $avg: "$totalAmount" },
          },
        },
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ["cancel", "returned"] }, createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({
      data: {
        ...(summary[0] || { revenue: 0, orders: 0, averageOrder: 0 }),
        daily,
        gateways: [
          { name: "Stripe", configured: Boolean(secret.stripe_key) },
        ],
        note: "مفاتيح بوابة الدفع محفوظة في متغيرات بيئة الخادم ولا يمكن عرضها أو تعديلها من اللوحة. لا يسجل النظام حالة تحصيل المدفوعات؛ الإجماليات تمثل قيمة الطلبات غير الملغاة وليست مبالغ محصلة.",
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AdminAuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .select("actorName actorRole action resource resourceId method path statusCode ipAddress createdAt");
    res.json({ data: logs });
  } catch (error) {
    next(error);
  }
};

const getSupportReadiness = async (req, res, next) => {
  try {
    const [customers, orders, recentReviews] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
    ]);
    res.json({
      data: {
        customers,
        orders,
        reviews: recentReviews,
        complaintsAvailable: false,
        message: "لا يوجد نموذج شكاوى أو محادثات دعم في قاعدة البيانات الحالية.",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStatus,
  getOverview,
  searchPortal,
  getProducts,
  getProductOptions,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  searchOrdersByPhone,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getFinance,
  getAuditLogs,
  getSupportReadiness,
};
