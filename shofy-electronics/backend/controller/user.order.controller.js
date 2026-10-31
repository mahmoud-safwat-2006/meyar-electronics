const mongoose = require("mongoose");
const Order = require("../model/Order");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

// ==========================================
// 1. جلب طلبات العميل مع ترقيم الصفحات وإحصائيات الحالة
// ==========================================
module.exports.getOrderByUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 8);
    const skip = (page - 1) * limit;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // حساب إجمالي طلبات المستخدم
    const totalDoc = await Order.countDocuments({ user: userObjectId });

    // استعلام مجمّع واحد وسريع لحساب عدد الطلبات حسب كل حالة
    const statusCounts = await Order.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let pending = 0;
    let processing = 0;
    let delivered = 0;

    statusCounts.forEach((item) => {
      if (item._id === "pending") pending = item.count;
      else if (item._id === "processing") processing = item.count;
      else if (item._id === "delivered") delivered = item.count;
    });

    // جلب طلبات الصفحة الحالية فقط مع الترتيب والحد الصحيح
    const orders = await Order.find({ user: userObjectId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      orders,
      pending,
      processing,
      delivered,
      totalDoc,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. جلب تفاصيل طلب محدد (مع سد ثغرة IDOR)
// ==========================================
module.exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // منع أي مستخدم من الاطلاع على طلبات مستخدمين آخرين ما لم يكن مديراً
    if (
      req.user &&
      req.user.role !== "Admin" &&
      order.user &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have permission to view this order.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. إحصائيات لوحة التحكم المالية بأعلى سرعة وبدون استهلاك الرام
// ==========================================
exports.getDashboardAmount = async (req, res, next) => {
  try {
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();

    const yesterdayStart = dayjs().subtract(1, "day").startOf("day").toDate();
    const yesterdayEnd = dayjs().subtract(1, "day").endOf("day").toDate();

    const monthStart = dayjs().startOf("month").toDate();
    const monthEnd = dayjs().endOf("month").toDate();

    // 1. مبيعات اليوم حسب طريقة الدفع
    const todayStats = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$totalAmount" },
        },
      },
    ]);

    let todayCashPaymentAmount = 0;
    let todayCardPaymentAmount = 0;
    let todayOrderAmount = 0;

    todayStats.forEach((stat) => {
      todayOrderAmount += stat.amount || 0;
      if (stat._id === "COD") todayCashPaymentAmount = stat.amount || 0;
      else if (stat._id === "Card") todayCardPaymentAmount = stat.amount || 0;
    });

    // 2. مبيعات الأمس
    const yesterdayStats = await Order.aggregate([
      { $match: { createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } } },
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$totalAmount" },
        },
      },
    ]);

    let yesterDayCashPaymentAmount = 0;
    let yesterDayCardPaymentAmount = 0;
    let yesterdayOrderAmount = 0;

    yesterdayStats.forEach((stat) => {
      yesterdayOrderAmount += stat.amount || 0;
      if (stat._id === "COD") yesterDayCashPaymentAmount = stat.amount || 0;
      else if (stat._id === "Card") yesterDayCardPaymentAmount = stat.amount || 0;
    });

    // 3. مبيعات الشهر الحالي
    const monthStats = await Order.aggregate([
      { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const monthlyOrderAmount = monthStats.length > 0 ? monthStats[0].total : 0;

    // 4. إجمالي المبيعات الكلي (حساب فوري دون تحميل الوثائق في الذاكرة)
    const overallStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalOrderAmount = overallStats.length > 0 ? overallStats[0].total : 0;

    res.status(200).json({
      todayOrderAmount,
      yesterdayOrderAmount,
      monthlyOrderAmount,
      totalOrderAmount,
      todayCardPaymentAmount,
      todayCashPaymentAmount,
      yesterDayCardPaymentAmount,
      yesterDayCashPaymentAmount,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. تقرير المبيعات الأسبوعي
// ==========================================
exports.getSalesReport = async (req, res, next) => {
  try {
    const startOfWeek = dayjs().subtract(7, "day").startOf("day").toDate();

    const salesReportData = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          order: { $sum: 1 },
        },
      },
      { $project: { date: "$_id", total: 1, order: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json({ salesReport: salesReportData });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. الأقسام الأكثر مبيعاً
// ==========================================
exports.mostSellingCategory = async (req, res, next) => {
  try {
    const categoryData = await Order.aggregate([
      { $unwind: "$cart" },
      {
        $group: {
          _id: "$cart.productType",
          count: { $sum: "$cart.orderQuantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({ categoryData });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. أحدث الطلبات للوحة التحكم مع تطبيق الترقيم (Pagination)
// ==========================================
exports.getDashboardRecentOrder = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 8);
    const skip = (page - 1) * limit;

    const queryObject = {
      status: { $in: ["pending", "processing", "delivered", "cancel"] },
    };

    const totalDoc = await Order.countDocuments(queryObject);

    const orders = await Order.aggregate([
      { $match: queryObject },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          invoice: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentMethod: 1,
          name: 1,
          user: 1,
          totalAmount: 1,
          status: 1,
        },
      },
    ]);

    res.status(200).json({
      orders,
      page,
      limit,
      totalOrder: totalDoc,
    });
  } catch (error) {
    next(error);
  }
};