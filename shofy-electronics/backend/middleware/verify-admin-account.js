const Admin = require("../model/Admin");

module.exports = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user?._id)
      .select("name role status")
      .lean();

    if (!admin || admin.status === "Inactive") {
      return res.status(401).json({
        status: "fail",
        message: "هذا الحساب غير نشط أو لم يعد لديه صلاحية الوصول.",
      });
    }

    req.user = { ...req.user, name: admin.name, role: admin.role };
    next();
  } catch (error) {
    next(error);
  }
};
