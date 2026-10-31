const express = require('express');
const router = express.Router();
const {
  addCoupon,
  addAllCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require('../controller/coupon.controller');
const { isAuth, isAdmin } = require('../config/auth');

// ==========================================
// مسارات عامة (عرض الكوبونات للمتجر والعملاء)
// ==========================================

// جلب جميع الكوبونات المتاحة
router.get('/', getAllCoupons);

// جلب تفاصيل كوبون محدد عبر المعرف
router.get('/:id', getCouponById);

// ==========================================
// مسارات الإدارة (محمية حصرياً للمديرين)
// ==========================================

// إضافة كوبون جديد
router.post('/add', isAuth, isAdmin, addCoupon);

// إضافة مجموعة كوبونات مجمعة
router.post('/all', isAuth, isAdmin, addAllCoupon);

// تعديل بيانات كوبون
router.patch('/:id', isAuth, isAdmin, updateCoupon);

// حذف كوبون
router.delete('/:id', isAuth, isAdmin, deleteCoupon);

module.exports = router;