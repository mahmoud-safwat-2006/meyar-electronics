const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { isAdmin } = require("../config/auth");
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

module.exports = router;