const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { isAdmin } = require("../config/auth");
const {
  paymentIntent,
  addOrder,
  getOrders,
  updateOrderStatus,
  getSingleOrder,
} = require("../controller/order.controller");

// 1. مسارات العميل للشراء والدفع (محمية بـ verifyToken)
router.post("/create-payment-intent", verifyToken, paymentIntent);
router.post("/saveOrder", verifyToken, addOrder);

// 2. استعراض تفاصيل طلب محدد (محمي بـ verifyToken مع فحص الملكية)
router.get("/:id", verifyToken, getSingleOrder);

// 3. مسارات لوحة تحكم المشرف فقط (محمية بـ verifyToken و isAdmin)
router.get("/orders", verifyToken, isAdmin, getOrders);
router.patch("/update-status/:id", verifyToken, isAdmin, updateOrderStatus);

module.exports = router;