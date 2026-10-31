const express = require('express');
const router = express.Router();
const categoryController = require('../controller/category.controller');
const { isAuth, isAdmin } = require('../config/auth');

// ==========================================
// مسارات عامة (عرض الأقسام لزوار وعملاء المتجر)
// ==========================================

// جلب جميع الأقسام
router.get('/all', categoryController.getAllCategory);

// جلب الأقسام المعروضة في الصفحة الرئيسية
router.get('/show', categoryController.getShowCategory);

// جلب أقسام حسب نوع المنتج
router.get('/show/:type', categoryController.getProductTypeCategory);

// جلب تفاصيل قسم محدد
router.get('/get/:id', categoryController.getSingleCategory);

// ==========================================
// مسارات الإدارة (محمية حصرياً للمديرين)
// ==========================================

// إضافة قسم جديد
router.post('/add', isAuth, isAdmin, categoryController.addCategory);

// إضافة مجموعة أقسام مجمعة
router.post('/add-all', isAuth, isAdmin, categoryController.addAllCategory);

// تعديل بيانات قسم
router.patch('/edit/:id', isAuth, isAdmin, categoryController.updateCategory);

// حذف قسم
router.delete('/delete/:id', isAuth, isAdmin, categoryController.deleteCategory);

module.exports = router;