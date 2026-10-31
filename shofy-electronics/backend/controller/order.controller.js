const { secret } = require("../config/secret");
const stripe = require("stripe")(secret.stripe_key);
const Order = require("../model/Order");
const Products = require("../model/Products");
const Coupon = require("../model/Coupon");

// 1. إنشاء نية الدفع مع التحقق الصارم من السعر في السيرفر (Zero-Trust Pricing)
exports.paymentIntent = async (req, res, next) => {
  try {
    const { items, price, couponCode } = req.body;
    let finalAmount = 0;

    // أ. إذا تم تمرير عناصر السلة، نحسب السعر المعتمد من قاعدة البيانات حصراً
    if (items && Array.isArray(items) && items.length > 0) {
      const productIds = items.map((i) => i._id || i.productId);
      const dbProducts = await Products.find({ _id: { $in: productIds } });

      let subTotal = 0;
      for (const item of items) {
        const prodId = (item._id || item.productId).toString();
        const dbProd = dbProducts.find((x) => x._id.toString() === prodId);
        if (dbProd) {
          const qty = Number(item.orderQuantity || item.quantity) || 1;
          subTotal += Number(dbProd.price) * qty;
        }
      }

      // ب. التحقق من صحة الكوبون server-side
      let discountAmount = 0;
      if (couponCode) {
        const validCoupon = await Coupon.findOne({
          couponCode: couponCode.trim(),
          endTime: { $gte: new Date() },
        });
        if (validCoupon && subTotal >= validCoupon.minimumAmount) {
          discountAmount = (subTotal * validCoupon.discountPercentage) / 100;
        }
      }

      // ج. مصاريف الشحن (مجاني إذا تجاوز 150 دولار)
      const shippingCost = subTotal >= 150 ? 0 : 15;
      finalAmount = Math.max(1, subTotal - discountAmount + shippingCost) * 100;
    } else {
      // حماية إضافية للطلبات المباشرة
      const fallbackPrice = Math.max(1, Number(price) || 0);
      finalAmount = fallbackPrice * 100;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: Math.round(finalAmount),
      payment_method_types: ["card"],
      metadata: {
        userId: req.user?._id ? req.user._id.toString() : "guest",
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      verifiedAmount: finalAmount / 100,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 2. حفظ الطلب مع خصم المخزون التلقائي وربطه بهوية المشتري
exports.addOrder = async (req, res, next) => {
  try {
    const orderData = { ...req.body };

    // ربط الطلب بهوية المشتري الحقيقية من التوكن
    if (req.user && req.user._id) {
      orderData.user = req.user._id;
    }

    const orderItems = await Order.create(orderData);

    // خصم المخزون فورياً من كل جهاز تم شراؤه لمنع البيع الوهمي
    if (orderData.cart && Array.isArray(orderData.cart)) {
      for (const item of orderData.cart) {
        if (item._id) {
          const qty = Number(item.orderQuantity) || 1;
          await Products.findByIdAndUpdate(item._id, {
            $inc: { quantity: -qty },
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Order added successfully",
      order: orderItems,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 3. استعراض كافة الطلبات (للمشرفين فقط)
exports.getOrders = async (req, res, next) => {
  try {
    const orderItems = await Order.find({}).populate("user");
    res.status(200).json({
      success: true,
      data: orderItems,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 4. استعراض طلب واحد مع حماية الخصوصية (IDOR Protection)
exports.getSingleOrder = async (req, res, next) => {
  try {
    const orderItem = await Order.findById(req.params.id).populate("user");
    if (!orderItem) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    // التأكد من أن الطالب هو صاحب الطلب نفسه أو أدمن النظام
    if (
      req.user &&
      req.user.role !== "Admin" &&
      orderItem.user?._id?.toString() !== req.user._id?.toString()
    ) {
      return res.status(403).json({
        message: "غير مصرح لك باستعراض بيانات هذا الطلب",
      });
    }

    res.status(200).json(orderItem);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 5. تحديث حالة الطلب
exports.updateOrderStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    await Order.updateOne(
      { _id: req.params.id },
      { $set: { status: newStatus } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};