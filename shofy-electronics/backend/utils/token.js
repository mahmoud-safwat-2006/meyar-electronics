const jwt = require("jsonwebtoken");
const { secret } = require("../config/secret");

// إنشاء توكن الدخول الرسمي (صالح لمدة سنة كاملة ليبقى العميل مسجلاً دائماً)
exports.generateToken = (userInfo) => {
  const payload = {
    _id: userInfo._id,
    name: userInfo.name,
    email: userInfo.email,
    role: userInfo.role || "user",
  };

  const token = jwt.sign(payload, secret.token_secret, {
    expiresIn: "365d", // سنة كاملة حتى لا يخرج العميل إلا بطلب تسجيل خروج
  });

  return token;
};

// إنشاء توكن التحقق والاسترجاع (مؤمن 100% بدون تسريب كلمة المرور)
exports.tokenForVerify = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    secret.jwt_secret_for_verify,
    { expiresIn: "15m" } // 15 دقيقة فقط لأعلى حماية أمنية لرابط الإيميل
  );
};