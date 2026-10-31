const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "يرجى إدخال الاسم"],
      trim: true,
      minLength: [3, "الاسم يجب ألا يقل عن 3 أحرف"],
      maxLength: [100, "الاسم طويل جداً"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "يرجى تقديم بريد إلكتروني صالح"],
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "البريد الإلكتروني مطلوب"],
    },
    password: {
      type: String,
      required: false, // اختياري لحسابات الدخول عبر Google
      minLength: [6, "كلمة المرور يجب ألا تقل عن 6 أحرف"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    contactNumber: {
      type: String,
      required: false,
    },
    shippingAddress: {
      type: String,
      required: false,
    },
    imageURL: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: "inactive",
      enum: ["active", "inactive", "blocked"],
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reviews" }],
    confirmationToken: String,
    confirmationTokenExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// هوك التشفير الآمن قبل الحفظ (مع الحماية التامة من التشفير المزدوج)
userSchema.pre("save", function (next) {
  // إذا لم يتم تعديل الباسورد أو الحساب قادم من Google بدون باسورد
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  // منع التشفير المزدوج إذا كان الباسورد مشفراً مسبقاً بـ bcrypt
  const isAlreadyHashed =
    this.password.startsWith("$2a$") || this.password.startsWith("$2b$");

  if (!isAlreadyHashed) {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  next();
});

// مقارنة كلمة المرور بأمان
userSchema.methods.comparePassword = function (enteredPassword, storedHash) {
  if (!enteredPassword || !storedHash) {
    return false;
  }
  return bcrypt.compareSync(enteredPassword, storedHash);
};

// توليد توكن التحقق والتفعيل
userSchema.methods.generateConfirmationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.confirmationToken = token;
  const date = new Date();
  date.setDate(date.getDate() + 1); // 24 ساعة لتفعيل الحساب
  this.confirmationTokenExpires = date;
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;