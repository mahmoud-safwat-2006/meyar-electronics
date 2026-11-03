const AdminAuditLog = require("../model/AdminAuditLog");

module.exports = (req, res, next) => {
  res.on("finish", () => {
    if (!["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) return;

    AdminAuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: `${req.method} ${req.baseUrl}${req.path}`,
      resource: req.baseUrl.split("/").pop() || "admin",
      resourceId: req.params.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      ipAddress: req.ip,
    }).catch((error) => {
      console.error("Admin audit log write failed:", error.message);
    });
  });

  next();
};
