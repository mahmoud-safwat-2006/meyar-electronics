const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const { isAuth, isAdmin } = require('../config/auth');

// ==========================================
// 1. مسارات التصفح العامة (متاحة لزوار وعملاء المتجر)
// ==========================================

// جلب جميع المنتجات
router.get('/all', productController.getAllProducts);

// جلب منتجات العروض المؤقتة
router.get('/offer', productController.getOfferTimerProducts);

// جلب المنتجات الأعلى تقييماً
router.get('/top-rated', productController.getTopRatedProducts);

// جلب المنتجات حسب التقييم
router.get('/review-product', productController.reviewProducts);

// جلب المنتجات الشائعة حسب القسم
router.get('/popular/:type', productController.getPopularProductByType);

// جلب المنتجات ذات الصلة
router.get('/related-product/:id', productController.getRelatedProducts);

// جلب منتج واحد بالتفصيل
router.get("/single-product/:id", productController.getSingleProduct);

// جلب المنتجات التي نفذت من المخزون
router.get("/stock-out", productController.stockOutProducts);

// جلب المنتجات حسب القسم أو النوع
router.get('/:type', productController.getProductsByType);

// ==========================================
// 2. مسارات الإدارة الحصرية (محمية للمديرين فقط)
// ==========================================

// إضافة منتج جديد
router.post('/add', isAuth, isAdmin, productController.addProduct);

// إضافة منتجات متعددة دفعة واحدة
router.post('/add-all', isAuth, isAdmin, productController.addAllProducts);

// تعديل بيانات وسعر منتج
router.patch("/edit-product/:id", isAuth, isAdmin, productController.updateProduct);

// حذف منتج من المتجر
router.delete('/:id', isAuth, isAdmin, productController.deleteProduct);

module.exports = router;