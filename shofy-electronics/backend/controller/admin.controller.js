const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const jwt = require("jsonwebtoken");
const { tokenForVerify } = require("../config/auth");
const Admin = require("../model/Admin");
const { generateToken } = require("../utils/token");
const { sendEmail } = require("../config/email");
const { secret } = require("../config/secret");

// 1. تسجيل المدير (حماية: يمنع التسجيل المفتوح إذا كان هناك أدمن مسجل بالفعل)
const registerAdmin = async (req, res, next) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({
          status: "fail",
          message: "التسجيل المباشر مغلق، يجب إضافة الموظف الجديد عبر لوحة تحكم المشرف",
        });
      }
    }

    const isAdded = await Admin.findOne({ email: req.body.email });
    if (isAdded) {
      return res.status(403).json({
        message: "هذا البريد الإلكتروني مسجل بالفعل!",
      });
    }

    const newStaff = new Admin({
      name: req.body.name,
      email: req.body.email,
      role: adminCount === 0 ? "Admin" : req.body.role || "Staff",
      password: bcrypt.hashSync(req.body.password),
    });

    const staff = await newStaff.save();
    const token = generateToken(staff);

    res.status(200).json({
      token,
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      joiningData: Date.now(),
    });
  } catch (err) {
    next(err);
  }
};

// 2. تسجيل دخول الأدمن
const loginAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });

    if (
      admin &&
      admin.status !== "Inactive" &&
      bcrypt.compareSync(req.body.password, admin.password)
    ) {
      const token = generateToken(admin);
      res.status(200).json({
        token,
        _id: admin._id,
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
        image: admin.image,
        role: admin.role,
      });
    } else {
      res.status(401).json({
        message: "بيانات الدخول غير صحيحة!",
      });
    }
  } catch (err) {
    next(err);
  }
};

// 3. طلب استعادة كلمة المرور
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res.status(404).json({
        message: "لم يتم العثور على حساب بهذا البريد!",
      });
    }

    const token = tokenForVerify(admin);
    const body = {
      from: secret.email_user,
      to: `${email}`,
      subject: "إعادة تعيين كلمة المرور - معيار للإلكترونيات",
      html: `<h2>مرحباً ${admin.name || email}</h2>
      <p>تم استلام طلب لإعادة تعيين كلمة المرور لحسابك في <strong>معيار للإلكترونيات (Meyar Electronics)</strong>.</p>
      <p>هذا الرابط صالح لمدة <strong>15 دقيقة فقط</strong>.</p>
      <p style="margin-bottom:20px;">اضغط على الزر التالي لتعيين كلمة مرور جديدة:</p>
      <a href="${secret.admin_url}/forget-password/${token}" style="background:#0989FF;color:white;border:1px solid #0989FF; padding: 10px 15px; border-radius: 4px; text-decoration:none;">إعادة تعيين كلمة المرور</a>
      <p style="margin-top: 35px;">فريق أمان معيار للإلكترونيات</p>`,
    };

    admin.confirmationToken = token;
    const date = new Date();
    date.setDate(date.getDate() + 1);
    admin.confirmationTokenExpires = date;
    await admin.save({ validateBeforeSave: false });

    const message = "تم إرسال رابط استعادة كلمة السر إلى بريدك الإلكتروني!";
    sendEmail(body, res, message);
  } catch (error) {
    next(error);
  }
};

// 4. تأكيد استعادة كلمة السر (تم تصحيح خطأ المتغير user إلى admin)
const confirmAdminForgetPass = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const admin = await Admin.findOne({ confirmationToken: token });

    if (!admin) {
      return res.status(403).json({
        status: "fail",
        message: "رمز التحقق غير صالح أو مستخدم مسبقاً",
      });
    }

    // تصحيح: استخدام admin بدلاً من user
    const expired = new Date() > new Date(admin.confirmationTokenExpires);
    if (expired) {
      return res.status(401).json({
        status: "fail",
        message: "انتهت صلاحية الرابط، يرجى طلب رابط جديد",
      });
    } else {
      const newPassword = bcrypt.hashSync(password);
      await Admin.updateOne(
        { confirmationToken: token },
        { $set: { password: newPassword } }
      );

      admin.confirmationToken = undefined;
      admin.confirmationTokenExpires = undefined;
      await admin.save({ validateBeforeSave: false });

      res.status(200).json({
        message: "تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن",
      });
    }
  } catch (error) {
    next(error);
  }
};

// 5. تغيير كلمة المرور من داخل لوحة التحكم
const changePassword = async (req, res, next) => {
  try {
    const { email, oldPass, newPass } = req.body || {};
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res.status(404).json({ message: "الحساب غير موجود" });
    }

    if (!bcrypt.compareSync(oldPass, admin.password)) {
      return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
    } else {
      const hashedPassword = bcrypt.hashSync(newPass);
      await Admin.updateOne({ email: email }, { password: hashedPassword });
      res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
    }
  } catch (error) {
    next(error);
  }
};

// 6. إضافة موظف جديد
const addStaff = async (req, res, next) => {
  try {
    const isAdded = await Admin.findOne({ email: req.body.email });
    if (isAdded) {
      return res.status(400).json({
        message: "هذا البريد الإلكتروني مسجل مسبقاً لموظف آخر!",
      });
    }

    const newStaff = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      phone: req.body.phone,
      joiningDate: req.body.joiningDate || new Date(),
      role: req.body.role || "Staff",
      image: req.body.image,
    });

    await newStaff.save();
    res.status(200).json({
      message: "تمت إضافة الموظف بنجاح إلى معيار للإلكترونيات!",
    });
  } catch (err) {
    next(err);
  }
};

// 7. استعراض كافة المشرفين
const getAllStaff = async (req, res, next) => {
  try {
    const admins = await Admin.find({}).select("-password").sort({ _id: -1 });
    res.status(200).json({
      status: true,
      message: "Staff retrieved successfully",
      data: admins,
    });
  } catch (err) {
    next(err);
  }
};

// 8. استعراض بيانات مشرف محدد
const getStaffById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "الموظف غير موجود" });
    }
    res.status(200).json(admin);
  } catch (err) {
    next(err);
  }
};

// 9. تعديل بيانات موظف
const updateStaff = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ _id: req.params.id });
    if (admin) {
      admin.name = req.body.name || admin.name;
      admin.email = req.body.email || admin.email;
      admin.phone = req.body.phone || admin.phone;
      admin.role = req.body.role || admin.role;
      admin.image = req.body.image || admin.image;

      if (req.body.password) {
        admin.password = bcrypt.hashSync(req.body.password);
      }

      const updatedAdmin = await admin.save();
      const token = generateToken(updatedAdmin);

      res.status(200).json({
        token,
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        image: updatedAdmin.image,
        phone: updatedAdmin.phone,
      });
    } else {
      res.status(404).json({
        message: "الموظف غير موجود!",
      });
    }
  } catch (err) {
    next(err);
  }
};

// 10. حذف موظف
const deleteStaff = async (req, res, next) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "تم حذف الموظف بنجاح",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  forgetPassword,
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  changePassword,
  confirmAdminForgetPass,
};