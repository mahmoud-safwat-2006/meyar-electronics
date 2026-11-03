const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shofy_admin:ShofyPass2026@cluster0.xgoa0sb.mongodb.net/shofy-electronics?retryWrites=true&w=majority";

async function runFix() {
  console.log("=================================================");
  console.log("🔄 جاري تصحيح الأقسام والمنتجات في MongoDB Atlas...");
  console.log("=================================================");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  // 1. أقسام الإلكترونيات الأساسية لمتجر Shofy لحل مشكلة No Category found!
  const categoriesColl = db.collection("categories");
  await categoriesColl.deleteMany({});
  await categoriesColl.insertMany([
    {
      parent: "Computers & Laptops",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      status: "Show",
      children: ["MacBooks", "Gaming Laptops", "Ultrabooks", "PC Accessories"]
    },
    {
      parent: "Smartphones & Tablets",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
      status: "Show",
      children: ["iPhones", "iPad Pro", "Android Phones", "Tablets"]
    },
    {
      parent: "Audio & Headphones",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      status: "Show",
      children: ["Noise Canceling", "Wireless Earbuds", "Hi-Res Audio", "Bluetooth Speakers"]
    },
    {
      parent: "Wearable & Smartwatches",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      status: "Show",
      children: ["Apple Watch", "Fitness Trackers", "Smart Bands"]
    },
    {
      parent: "Cameras & Drones",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      status: "Show",
      children: ["DSLR", "Mirrorless", "Action Cameras", "Lenses"]
    }
  ]);
  console.log("✔ تم إنشاء 5 أقسام رئيسية للإلكترونيات وضبط status: 'Show'!");

  // 2. تحديث المنتجات لتأخذ productType الدقيق المتوافق مع الفلترة
  const productsColl = db.collection("products");
  
  // تحديث الإلكترونيات
  await productsColl.updateMany(
    { $or: [{ sku: /^SFW-EL/ }, { parent: "Electronics" }] },
    { $set: { productType: "electronics", status: "in-stock", featured: true } }
  );

  // تحديث الأزياء
  await productsColl.updateMany(
    { $or: [{ sku: /^SFW-FA/ }, { parent: "Fashion" }] },
    { $set: { productType: "fashion", status: "in-stock" } }
  );

  // تحديث العناية والجمال
  await productsColl.updateMany(
    { $or: [{ sku: /^SFW-BT/ }, { parent: "Beauty" }] },
    { $set: { productType: "beauty", status: "in-stock" } }
  );

  // تحديث المجوهرات والساعات
  await productsColl.updateMany(
    { $or: [{ sku: /^SFW-JW/ }, { parent: "Jewelry" }] },
    { $set: { productType: "jewelry", status: "in-stock" } }
  );

  // تحديث المنزل
  await productsColl.updateMany(
    { $or: [{ sku: /^SFW-HM/ }, { parent: "Home" }] },
    { $set: { productType: "home", status: "in-stock" } }
  );

  // تحديث السوبرماركت
  await productsColl.updateMany(
    { $or: [{ sku: /^SFW-GR/ }, { parent: "Supermarket" }] },
    { $set: { productType: "supermarket", status: "in-stock" } }
  );

  console.log("✔ تم تحديث جميع المنتجات وتعيين productType لكل قطاع بنجاح!");
  console.log("=================================================");
  console.log("🎉 انتهت المعالجة! اعمل Refresh الآن لصفحتي:");
  console.log("1. http://localhost:3001/products?department=electronics");
  console.log("2. http://localhost:3000 (المتجر الرئيسي)");
  console.log("=================================================");

  await mongoose.disconnect();
  process.exit(0);
}

runFix();
