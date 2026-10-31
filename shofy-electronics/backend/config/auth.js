require("dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");
const { secret } = require("./secret");

// إنشاء توكن تسجيل الدخول مع حفظ دور المستخدم
const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
      role: user.role || "user",
    },
    secret.token_secret,
    {
      expiresIn: "2d",
    }
  );
};

// إنشاء توكن التحقق (بدون تسريب هاش كلمة السر نهائياً)
const tokenForVerify = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    secret.jwt_secret_for_verify,
    { expiresIn: "15m" }
  );
};

// فحص تسجيل الدخول
const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) {
      return res.status(401).json({
        status: "fail",
        message: "يجب تسجيل الدخول أولاً",
      });
    }
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, secret.token_secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

// حماية الأدمن الصارمة: فحص المستخدم الحالي المتصل حصراً
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      status: "fail",
      message: "يجب تسجيل الدخول أولاً بحساب مدير",
    });
  }
  const userRole = (req.user.role || "").toLowerCase();
  if (userRole !== "admin" && userRole !== "super-admin") {
    return res.status(403).json({
      status: "fail",
      message: "هذا الإجراء مخصص لمدراء معيار للإلكترونيات فقط",
    });
  }
  next();
};

module.exports = {
  signInToken,
  tokenForVerify,
  isAuth,
  isAdmin,
};