const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { isAdmin } = require("../config/auth");
const authorize = require("../middleware/authorization");
const adminAudit = require("../middleware/admin-audit");
const verifyAdminAccount = require("../middleware/verify-admin-account");
const portal = require("../controller/admin.portal.controller");
const {
  registerAdmin,
  loginAdmin,
  updateStaff,
  changePassword,
  addStaff,
  getAllStaff,
  deleteStaff,
  getStaffById,
  forgetPassword,
  confirmAdminEmail,
  confirmAdminForgetPass,
} = require("../controller/admin.controller");

// 1. مسارات تسجيل الدخول واستعادة الحساب العامة
router.post("/login", loginAdmin);
router.patch("/forget-password", forgetPassword);
router.patch("/confirm-forget-password", confirmAdminForgetPass);

// 2. مسار تسجيل المدير الأول (مؤمن داخل الكنترولر)
router.post("/register", registerAdmin);

// 3. مسارات الإدارة المحمية حصرياً لمدراء معيار للإلكترونيات (verifyToken + isAdmin)
router.patch("/change-password", verifyToken, isAdmin, changePassword);
router.post("/add", verifyToken, isAdmin, addStaff);
router.get("/all", verifyToken, isAdmin, getAllStaff);
router.get("/get/:id", verifyToken, isAdmin, getStaffById);
router.patch("/update-stuff/:id", verifyToken, isAdmin, updateStaff);
router.delete("/:id", verifyToken, isAdmin, deleteStaff);

// مسارات لوحة الإدارة المنفصلة؛ كل وحدة محمية بحسب دور الموظف.
const portalRouter = express.Router();
portalRouter.use(verifyToken, verifyAdminAccount, adminAudit);
portalRouter.get("/system", portal.getSystemStatus);
portalRouter.get("/overview", portal.getOverview);
portalRouter.get("/search", portal.searchPortal);
portalRouter.get("/products/options", authorize("Warehouse Manager", "Catalog Editor", "Operations Manager"), portal.getProductOptions);
portalRouter.get("/products", authorize("Warehouse Manager", "Catalog Editor", "Operations Manager"), portal.getProducts);
portalRouter.post("/products", authorize("Warehouse Manager", "Catalog Editor"), portal.createProduct);
portalRouter.patch("/products/:id", authorize("Warehouse Manager", "Catalog Editor"), portal.updateProduct);
portalRouter.delete("/products/:id", authorize("Super Admin"), portal.deleteProduct);
portalRouter.get("/orders", authorize("Logistics Officer", "Fulfillment Lead", "Operations Manager", "Support Staff", "Support Agent", "Finance Manager", "Auditor"), portal.getOrders);
portalRouter.patch("/orders/:id/status", authorize("Logistics Officer", "Fulfillment Lead", "Operations Manager"), portal.updateOrderStatus);
portalRouter.get("/orders/search", authorize("Support Staff", "Support Agent"), portal.searchOrdersByPhone);
portalRouter.get("/coupons", authorize("Marketing Manager"), portal.getCoupons);
portalRouter.post("/coupons", authorize("Marketing Manager"), portal.createCoupon);
portalRouter.patch("/coupons/:id", authorize("Marketing Manager"), portal.updateCoupon);
portalRouter.delete("/coupons/:id", authorize("Marketing Manager"), portal.deleteCoupon);
portalRouter.get("/staff", authorize("Super Admin"), portal.getStaff);
portalRouter.post("/staff", authorize("Super Admin"), portal.createStaff);
portalRouter.patch("/staff/:id", authorize("Super Admin"), portal.updateStaff);
portalRouter.delete("/staff/:id", authorize("Super Admin"), portal.deleteStaff);
portalRouter.get("/finance", authorize("Finance Manager", "Auditor"), portal.getFinance);
portalRouter.get("/audit-logs", authorize("Super Admin"), portal.getAuditLogs);
portalRouter.get("/support", authorize("Support Staff", "Support Agent"), portal.getSupportReadiness);
router.use("/portal", portalRouter);

module.exports = router;