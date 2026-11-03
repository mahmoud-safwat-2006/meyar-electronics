const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.AdminAuditLog ||
  mongoose.model("AdminAuditLog", adminAuditLogSchema);
