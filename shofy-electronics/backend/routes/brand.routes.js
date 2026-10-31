const express = require('express');
const router = express.Router();
const brandController = require('../controller/brand.controller');
const { isAuth, isAdmin } = require('../config/auth');

// ==========================================
// مسارات عامة (عرض الماركات لزوار وعملاء المتجر)
// ==========================================

// جلب جميع الماركات المتاحة
router.get('/all', brandController.getAllBrands);

// جلب الماركات النشطة فقط للعرض في المتجر
router.get('/active', brandController.getActiveBrands);

// جلب تفاصيل ماركة محددة
router.get('/get/:id', brandController.getSingleBrand);

// ==========================================
// مسارات الإدارة (محمية حصرياً للمديرين)
// ==========================================

// إضافة ماركة جديدة
router.post('/add', isAuth, isAdmin, brandController.addBrand);

// إضافة مجموعة ماركات مجمعة
router.post('/add-all', isAuth, isAdmin, brandController.addAllBrand);

// تعديل بيانات ماركة
router.patch('/edit/:id', isAuth, isAdmin, brandController.updateBrand);

// حذف ماركة
router.delete('/delete/:id', isAuth, isAdmin, brandController.deleteBrand);

module.exports = router;