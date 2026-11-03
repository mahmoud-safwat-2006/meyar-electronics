// وسيط التحقق من الصلاحيات والرتب (RBAC Middleware)
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. حماية السيرفر من الانهيار إذا لم يكن المستخدم مصادقاً عليه
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: "fail",
        error: "يجب تسجيل الدخول أولاً للوصول إلى هذا القسم.",
      });
    }

    const userRole = req.user.role.toString().toLowerCase();

    // 2. منح الصلاحية الكاملة دائماً للمدير العام (Super Admin)
    if (userRole === "super admin" || userRole === "ceo" || userRole === "admin") {
      return next();
    }

    // 3. توحيد مقارنة الرتب بدون حساسية لحالة الأحرف لمنع أي أخطاء برمجية
    const roleAliases = {
      "operations manager": ["manager"],
      "catalog editor": ["warehouse manager"],
      "fulfillment lead": ["logistics officer"],
      "support agent": ["support staff"],
      auditor: ["finance manager"],
    };
    const normalizedAllowedRoles = allowedRoles.flatMap((role) => {
      const normalizedRole = role.toString().toLowerCase();
      return [normalizedRole, ...(roleAliases[normalizedRole] || [])];
    });

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: "fail",
        error: "عذراً، لا تمتلك الصلاحيات الإدارية الكافية للوصول إلى هذه الصفحة.",
      });
    }

    next();
  };
};