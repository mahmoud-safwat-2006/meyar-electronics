const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const { isAuth } = require('../config/auth');

// ==========================================
// 1. مسارات التسجيل والدخول العامة (Public Routes)
// ==========================================

// تسجيل حساب عميل جديد
router.post("/signup", userController.signup);

// تسجيل الدخول بالبريد وكلمة المرور
router.post("/login", userController.login);

// تسجيل الدخول السريع عبر Google
router.post("/register/:token", userController.signUpWithProvider);
router.post("/google/:token", userController.signUpWithProvider); // مسار بديل متوافق

// تأكيد البريد الإلكتروني (يدعم GET عند فتح الرابط و PATCH عبر واجهة Next.js)
router.get('/confirmEmail/:token', userController.confirmEmail);
router.patch('/confirmEmail/:token', userController.confirmEmail);

// إعادة إرسال رابط التفعيل إذا تأخر أو انتهت صلاحيته
router.post('/resend-verification', userController.resendEmailVerification);

// طلب استعادة كلمة المرور المنسية
router.patch('/forget-password', userController.forgetPassword);

// تأكيد تعيين كلمة المرور الجديدة عبر التوكن
router.patch('/confirm-forget-password', userController.confirmForgetPassword);

// ==========================================
// 2. مسارات العميل المحمية (تتطلب تسجيل الدخول الحقيقي)
// ==========================================

// تغيير كلمة المرور من داخل الحساب
router.patch('/change-password', isAuth, userController.changePassword);

// تحديث بيانات الملف الشخصي (محمي بـ isAuth لمنع ثغرات IDOR)
router.put('/update-user/:id', isAuth, userController.updateUser);

// جلب بيانات العميل المسجل حالياً
router.get('/me', isAuth, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;