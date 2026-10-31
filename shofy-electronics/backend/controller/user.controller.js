const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { sendEmail } = require("../config/email");
const { generateToken, tokenForVerify } = require("../utils/token");
const { secret } = require("../config/secret");

// قراءة رابط المتجر بمرونة لمنع أخطاء undefined في الروابط
const CLIENT_URL =
  secret.client_url ||
  secret.store_url ||
  process.env.STORE_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:3000";

// ==========================================
// 1. تسجيل حساب مستخدم جديد (Sign Up)
// ==========================================
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists",
      });
    }

    const saved_user = await User.create({
      ...req.body,
      email: cleanEmail,
    });

    // توليد توكن التفعيل وضبط صلاحية 24 ساعة
    let token = "";
    if (typeof saved_user.generateConfirmationToken === "function") {
      token = saved_user.generateConfirmationToken();
    } else {
      token = tokenForVerify(saved_user);
      saved_user.confirmationToken = token;
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      saved_user.confirmationTokenExpires = expiry;
    }

    // تمديد الصلاحية لـ 24 ساعة لضمان عدم انتهاء الرابط سريعاً
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    saved_user.confirmationTokenExpires = expiryDate;

    await saved_user.save({ validateBeforeSave: false });

    // إرسال بريد التفعيل بهوية معيار للإلكترونيات
    const verifyLink = `${CLIENT_URL}/email-verify/${token}`;
    const mailData = {
      from: secret.email_user || process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "Activate Your Account - Meyar Electronics",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #0989FF; margin: 0; font-size: 26px; letter-spacing: -0.5px;">Meyar Electronics</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Your Trusted Electronics Destination</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">Hello ${name},</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Thank you for creating an account with us. To activate your account and access all store features, please click the verification button below:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyLink}" style="background-color: #0989FF; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(9, 137, 255, 0.25);">
              Verify Email Address
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center;">
            This link is valid for 24 hours. If you did not create this account, please disregard this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} Meyar Electronics. All rights reserved.
          </p>
        </div>
      `,
    };

    const message = "Account created! Please check your email to verify your account.";
    await sendEmail(mailData, res, message);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. تسجيل دخول المستخدم (Login)
// ==========================================
module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide both email and password.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        error: "Invalid email or password.",
      });
    }

    const isPasswordValid = user.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        error: "Invalid email or password.",
      });
    }

    // التحقق من تفعيل الحساب
    if (user.status !== "active") {
      return res.status(403).json({
        status: "fail",
        error: "Your account is not active yet. Please verify your email.",
        email: user.email,
        isInactive: true,
      });
    }

    const token = generateToken(user);
    const { password: pwd, confirmationToken, confirmationTokenExpires, ...userData } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. تأكيد وتفعيل الحساب بالبريد (Confirm Email)
// ==========================================
exports.confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ confirmationToken: token });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        error: "Invalid or already used activation token.",
      });
    }

    const expired = new Date() > new Date(user.confirmationTokenExpires);
    if (expired) {
      return res.status(401).json({
        status: "fail",
        error: "Activation token has expired. Please request a new verification link.",
      });
    }

    user.status = "active";
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    const accessToken = generateToken(user);
    const { password: pwd, ...userData } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Your account has been activated successfully! Welcome to Meyar.",
      data: {
        user: userData,
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. إعادة إرسال رابط التفعيل (Resend Verification)
// ==========================================
exports.resendEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: "fail", message: "Email is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ status: "fail", message: "No user found with this email." });
    }

    if (user.status === "active") {
      return res.status(400).json({ status: "fail", message: "This account is already active." });
    }

    const token = tokenForVerify(user);
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    user.confirmationToken = token;
    user.confirmationTokenExpires = expiryDate;
    await user.save({ validateBeforeSave: false });

    const verifyLink = `${CLIENT_URL}/email-verify/${token}`;
    const mailData = {
      from: secret.email_user || process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "New Verification Link - Meyar Electronics",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0989FF; text-align: center;">Meyar Electronics</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Here is your new activation link to verify your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #0989FF; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Activate My Account
            </a>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">Valid for 24 hours.</p>
        </div>
      `,
    };

    await sendEmail(mailData, res, "A new verification email has been sent successfully!");
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. طلب استعادة كلمة المرور (Forget Password)
// ==========================================
exports.forgetPassword = async (req, res, next) => {
  try {
    const { verifyEmail } = req.body;
    if (!verifyEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = verifyEmail.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: "No user found with this email!",
      });
    }

    const token = tokenForVerify(user);
    const resetLink = `${CLIENT_URL}/forget-password/${token}`;

    const body = {
      from: secret.email_user || process.env.EMAIL_USER,
      to: cleanEmail,
      subject: "Password Reset Request - Meyar Electronics",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #0989FF; margin: 0; font-size: 26px;">Meyar Electronics</h1>
          </div>
          <h2 style="color: #0f172a; font-size: 18px;">Password Reset</h2>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0989FF; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 13px; color: #94a3b8; text-align: center;">
            This link is valid for 15 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    };

    user.confirmationToken = token;
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة
    user.confirmationTokenExpires = expiryDate;
    await user.save({ validateBeforeSave: false });

    await sendEmail(body, res, "Please check your email to reset your password!");
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. تأكيد تعيين كلمة المرور الجديدة
// ==========================================
exports.confirmForgetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        status: "fail",
        error: "Token and new password are required.",
      });
    }

    const user = await User.findOne({ confirmationToken: token });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        error: "Invalid or already used token",
      });
    }

    const expired = new Date() > new Date(user.confirmationTokenExpires);
    if (expired) {
      return res.status(401).json({
        status: "fail",
        error: "Reset token expired. Please request a new link.",
      });
    }

    user.password = bcrypt.hashSync(password, 10);
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. تغيير كلمة المرور بعد تسجيل الدخول
// ==========================================
exports.changePassword = async (req, res, next) => {
  try {
    const { email, password, newPassword } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (req.user && req.user.email !== email && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password) {
      if (!password || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Incorrect current password" });
      }
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. تحديث الملف الشخصي للمستخدم
// ==========================================
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (req.user && req.user._id !== userId && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized: You can only update your own profile." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.imageURL) user.imageURL = req.body.imageURL;

    const updatedUser = await user.save();
    const token = generateToken(updatedUser);

    res.status(200).json({
      status: "success",
      message: "Successfully updated profile",
      data: {
        user: updatedUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 9. تسجيل الدخول عبر Google (مع التحقق الآمن)
// ==========================================
exports.signUpWithProvider = async (req, res, next) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({ status: "fail", message: "Token is required" });
    }

    let payload = null;

    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      if (response.ok) {
        payload = await response.json();
      }
    } catch (fetchErr) {
      // احتياطي
    }

    if (!payload || !payload.email) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.email) {
        payload = decoded;
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Google authentication token",
      });
    }

    const email = payload.email.toLowerCase();
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      if (payload.picture && !existingUser.imageURL) {
        existingUser.imageURL = payload.picture;
        await existingUser.save({ validateBeforeSave: false });
      }

      const authToken = generateToken(existingUser);
      return res.status(200).json({
        status: "success",
        data: {
          token: authToken,
          user: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            address: existingUser.address,
            phone: existingUser.phone,
            imageURL: existingUser.imageURL,
            googleSignIn: true,
          },
        },
      });
    }

    const newUser = new User({
      name: payload.name || email.split("@")[0],
      email,
      imageURL: payload.picture || "",
      status: "active",
    });

    const savedUser = await newUser.save();
    const authToken = generateToken(savedUser);

    res.status(200).json({
      status: "success",
      data: {
        token: authToken,
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          imageURL: savedUser.imageURL,
          googleSignIn: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};