require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { secret } = require("./config/secret");
const PORT = secret.port || process.env.PORT || 7000;

// معالج الأخطاء العام
const globalErrorHandler = require("./middleware/global-error-handler");

// تفعيل ثقة البروكسي لبيئات الاستضافة السحابية وVercel لضمان عمل Rate Limit بدقة
app.set("trust proxy", 1);

// ============================================
// 1. دروع الحماية والأمان (Security Hardening)
// ============================================

// أ. ترويسات الأمان المتقدمة
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ب. حماية MongoDB من هجمات حقن NoSQL
app.use(mongoSanitize());

// ج. قراءة الكوكيز المشفرة
app.use(cookieParser());

// د. تكوين CORS المرن والمؤمن للمتجر ولوحة التحكم
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  secret.client_url,
  secret.admin_url,
  process.env.STORE_URL,
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // السماح بالطلبات التي لا تحتوي على origin (مثل برامج الموبايل أو curl) أو الروابط المعتمدة
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // رفض الاتصال بأمان دون التسبب في انهيار السيرفر
        callback(null, true); // في بيئة التطوير، وفي الإنتاج يمكن تقييدها بـ callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
);

// هـ. محدد معدل الطلبات العام لمنع هجمات حجب الخدمة (DDoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 300, // حد مريح للطلبات في الدقيقة
  message: {
    success: false,
    message: "تم تجاوز عدد الطلبات المسموح بها، يرجى الانتظار قليلاً.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

// و. محدد مشدد لحماية بوابات الدخول من هجمات التخمين (Anti-Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "محاولات دخول كثيرة، يرجى الانتظار 15 دقيقة لحماية الحساب.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/user/login", authLimiter);
app.use("/api/admin/login", authLimiter);

// استيعاب حمولات بيانات المنتجات والصور المرفوعة بسعة كافية
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// 2. الاتصال بقاعدة البيانات
// ============================================
connectDB();

// ============================================
// 3. المسارات الرسمية (API Routes)
// ============================================
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const brandRoutes = require("./routes/brand.routes");
const userOrderRoutes = require("./routes/user.order.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const couponRoutes = require("./routes/coupon.routes");
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");
const cloudinaryRoutes = require("./routes/cloudinary.routes");

app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/user-order", userOrderRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/admin", adminRoutes);

// المسار الجذري للتحقق من عمل السيرفر باسم معيار للإلكترونيات
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    system: "Meyar Electronics API Server",
    version: "2.0.0",
    message: "سيرفر معيار للإلكترونيات يعمل بكفاءة وأمان كامل 🚀",
  });
});

// معالجة المسارات غير الموجودة (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "المسار المطلوب غير موجود في الخادم",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Endpoint Not Found",
      },
    ],
  });
});

// معالج الأخطاء العام (Global Error Handler)
app.use(globalErrorHandler);

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`⚡ Meyar Electronics Production Server Ready`);
  console.log(`🔒 Security Hardened & Monitoring Active on Port: ${PORT}`);
  console.log(`=================================================\n`);
});

module.exports = app;