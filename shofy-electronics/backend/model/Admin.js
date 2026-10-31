const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم المدير أو الموظف مطلوب"],
      trim: true,
    },
    image: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني للمدير مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
      default: "Active",
      enum: ["Active", "Inactive"],
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة ولا يمكن تركها فارغة"],
      minLength: [6, "كلمة المرور يجب ألا تقل عن 6 أحرف"],
    },
    role: {
      type: String,
      required: true,
      default: "Admin",
      enum: [
        "Admin",
        "Super Admin",
        "Manager",
        "CEO",
      ],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    confirmationToken: String,
    confirmationTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

// هوك تشفير كلمة المرور قبل الحفظ بأمان تام
adminSchema.pre("save", function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  // منع التشفير المزدوج
  const isAlreadyHashed =
    this.password.startsWith("$2a$") || this.password.startsWith("$2b$");

  if (!isAlreadyHashed) {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  next();
});

// دالة مقارنة كلمة المرور للمدير
adminSchema.methods.comparePassword = function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  return bcrypt.compareSync(enteredPassword, this.password);
};

// توليد توكن التحقق والاسترجاع
adminSchema.methods.generateConfirmationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.confirmationToken = token;
  const date = new Date();
  date.setDate(date.getDate() + 1);
  this.confirmationTokenExpires = date;
  return token;
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;