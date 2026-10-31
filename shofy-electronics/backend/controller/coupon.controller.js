const Coupon = require('../model/Coupon');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

// إضافة كوبون جديد
const addCoupon = async (req, res, next) => {
  try {
    const {
      title,
      couponCode,
      endTime,
      discountPercentage,
      minimumAmount,
      productType,
      logo,
    } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const cleanCode = couponCode.trim().toUpperCase();

    // التحقق من عدم تكرار كود الكوبون
    const existingCoupon = await Coupon.findOne({ couponCode: cleanCode });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    const newCoupon = new Coupon({
      title,
      couponCode: cleanCode,
      startTime: req.body.startTime ? dayjs(req.body.startTime).utc().toDate() : new Date(),
      endTime: endTime ? dayjs(endTime).utc().toDate() : null,
      discountPercentage: Number(discountPercentage) || 0,
      minimumAmount: Number(minimumAmount) || 0,
      productType: productType || 'electronics',
      logo: logo || '',
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon Added Successfully!',
      coupon: newCoupon,
    });
  } catch (error) {
    next(error);
  }
};

// إضافة مجموعة كوبونات بدون حذف الكوبونات القديمة (Safe Batch Insert)
const addAllCoupon = async (req, res, next) => {
  try {
    const coupons = req.body;
    if (!Array.isArray(coupons) || coupons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of coupons',
      });
    }

    // تنسيق وتأمين بيانات الكوبونات المجمعة
    const formattedCoupons = coupons.map((item) => ({
      ...item,
      couponCode: item.couponCode ? item.couponCode.trim().toUpperCase() : '',
      startTime: item.startTime ? dayjs(item.startTime).utc().toDate() : new Date(),
      endTime: item.endTime ? dayjs(item.endTime).utc().toDate() : null,
      discountPercentage: Number(item.discountPercentage) || 0,
      minimumAmount: Number(item.minimumAmount) || 0,
    }));

    // إدخال مع تجاهل المكرر لحماية الكوبونات السابقة
    const result = await Coupon.insertMany(formattedCoupons, { ordered: false }).catch((err) => {
      // تجاهل أخطاء التكرار إذا كان الكوبون موجوداً بالفعل
      if (err.code === 11000) return err.insertedDocs;
      throw err;
    });

    res.status(200).json({
      success: true,
      message: 'Coupons processed successfully!',
      count: result ? result.length : formattedCoupons.length,
    });
  } catch (error) {
    next(error);
  }
};

// جلب جميع الكوبونات
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ _id: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    next(error);
  }
};

// جلب تفاصيل كوبون محدد
const getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }
    res.status(200).json(coupon);
  } catch (error) {
    next(error);
  }
};

// تحديث كوبون
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    if (req.body.title !== undefined) coupon.title = req.body.title;
    if (req.body.couponCode !== undefined) coupon.couponCode = req.body.couponCode.trim().toUpperCase();
    if (req.body.endTime !== undefined) {
      coupon.endTime = req.body.endTime ? dayjs(req.body.endTime).utc().toDate() : null;
    }
    if (req.body.discountPercentage !== undefined) coupon.discountPercentage = Number(req.body.discountPercentage);
    if (req.body.minimumAmount !== undefined) coupon.minimumAmount = Number(req.body.minimumAmount);
    if (req.body.productType !== undefined) coupon.productType = req.body.productType;
    if (req.body.logo !== undefined) coupon.logo = req.body.logo;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon Updated Successfully!',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// حذف كوبون
const deleteCoupon = async (req, res, next) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found or already deleted',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCoupon,
  addAllCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};