const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shofy_admin:ShofyPass2026@cluster0.xgoa0sb.mongodb.net/shofy-electronics?retryWrites=true&w=majority";

async function runSuperFix() {
  console.log("=================================================");
  console.log("🚀 جاري معالجة الكتالوج الشامل والماركات والأقسام...");
  console.log("=================================================");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  // 1. تحديث الأقسام وضمان أسمائها
  const categoriesColl = db.collection("categories");
  await categoriesColl.deleteMany({});
  await categoriesColl.insertMany([
    {
      parent: "Computers & Laptops",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      status: "Show",
      children: ["MacBooks", "Gaming Laptops", "PC Accessories", "Monitors"]
    },
    {
      parent: "Smartphones & Tablets",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
      status: "Show",
      children: ["iPhones", "Samsung Galaxy", "iPad Pro", "Android Tablets"]
    },
    {
      parent: "Audio & Headphones",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      status: "Show",
      children: ["Wireless Earbuds", "Noise Canceling", "Bluetooth Speakers"]
    },
    {
      parent: "Wearable & Smartwatches",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      status: "Show",
      children: ["Apple Watch", "Galaxy Watch", "Fitness Trackers"]
    },
    {
      parent: "Cameras & Drones",
      productType: "electronics",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      status: "Show",
      children: ["DSLR Cameras", "Mirrorless", "Drones", "Action Cams"]
    }
  ]);
  console.log("✔ تم ضبط جدول الأقسام categories!");

  // 2. حقن الماركات التجارية (Brands) لحل مشكلة No Brands found!
  const brandsColl = db.collection("brands");
  await brandsColl.deleteMany({});
  await brandsColl.insertMany([
    { name: "Apple", email: "contact@apple.com", website: "https://apple.com", location: "USA", status: "active", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200" },
    { name: "Sony", email: "contact@sony.com", website: "https://sony.com", location: "Japan", status: "active", logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
    { name: "Samsung", email: "contact@samsung.com", website: "https://samsung.com", location: "South Korea", status: "active", logo: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200" },
    { name: "Dell", email: "contact@dell.com", website: "https://dell.com", location: "USA", status: "active", logo: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200" },
    { name: "Bose", email: "contact@bose.com", website: "https://bose.com", location: "USA", status: "active", logo: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200" },
    { name: "Rolex", email: "contact@rolex.com", website: "https://rolex.com", location: "Switzerland", status: "active", logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200" },
    { name: "Dyson", email: "contact@dyson.com", website: "https://dyson.com", location: "UK", status: "active", logo: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200" }
  ]);
  console.log("✔ تم حقن الماركات التجارية (Brands) لحل مشكلة No Brands found!");

  // 3. تحديث منتجات الإلكترونيات وتوزيعها على الـ parent الصحيح لتعمل في shop-category
  const productsColl = db.collection("products");

  // ماك بوك
  await productsColl.updateOne(
    { sku: "SFW-EL-002" },
    {
      $set: {
        parent: "Computers & Laptops",
        children: "MacBooks",
        category: { name: "Computers & Laptops" },
        brand: { name: "Apple" },
        productType: "electronics",
        orderQuantity: 34,
        reviews: [{ rating: 5, comment: "Exceptional M3 Max performance" }]
      }
    }
  );

  // آيفون
  await productsColl.updateOne(
    { sku: "SFW-EL-001" },
    {
      $set: {
        parent: "Smartphones & Tablets",
        children: "iPhones",
        category: { name: "Smartphones & Tablets" },
        brand: { name: "Apple" },
        productType: "electronics",
        orderQuantity: 52,
        reviews: [{ rating: 5, comment: "Best battery and camera ever" }]
      }
    }
  );

  // آيباد
  await productsColl.updateOne(
    { sku: "SFW-EL-004" },
    {
      $set: {
        parent: "Smartphones & Tablets",
        children: "iPad Pro",
        category: { name: "Smartphones & Tablets" },
        brand: { name: "Apple" },
        productType: "electronics",
        orderQuantity: 28,
        reviews: [{ rating: 5, comment: "Tandem OLED is breathtaking" }]
      }
    }
  );

  // سماعات سوني
  await productsColl.updateOne(
    { sku: "SFW-EL-003" },
    {
      $set: {
        parent: "Audio & Headphones",
        children: "Noise Canceling",
        category: { name: "Audio & Headphones" },
        brand: { name: "Sony" },
        productType: "electronics",
        orderQuantity: 41,
        reviews: [{ rating: 5, comment: "Unbeatable noise cancellation" }]
      }
    }
  );

  // إضافة منتجات للأقسام المتبقية (الساعات الذكية والكاميرات ولابتوب ديل)
  const additionalProducts = [
    {
      sku: "SFW-EL-005",
      title: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium Case",
      name: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium Case",
      parent: "Wearable & Smartwatches",
      children: "Apple Watch",
      category: { name: "Wearable & Smartwatches" },
      brand: { name: "Apple" },
      productType: "electronics",
      price: 799,
      originalPrice: 849,
      discount: 6,
      quantity: 25,
      unit: "pcs",
      status: "in-stock",
      featured: true,
      orderQuantity: 30,
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      imageURLs: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"],
      description: "ساعة أبل ألترا 2 بهيكل تيتانيوم صلب، وشاشة 3000 شمعة وبطارية تدوم 72 ساعة.",
      tags: ["apple", "watch", "ultra"],
      reviews: [{ rating: 5, comment: "Top rugged smartwatch" }]
    },
    {
      sku: "SFW-EL-006",
      title: "Sony Alpha 7 IV Full-Frame Mirrorless 4K Camera",
      name: "Sony Alpha 7 IV Full-Frame Mirrorless 4K Camera",
      parent: "Cameras & Drones",
      children: "Mirrorless",
      category: { name: "Cameras & Drones" },
      brand: { name: "Sony" },
      productType: "electronics",
      price: 2498,
      originalPrice: 2699,
      discount: 7,
      quantity: 15,
      unit: "pcs",
      status: "in-stock",
      featured: true,
      orderQuantity: 19,
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
      imageURLs: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"],
      description: "كاميرا سوني الاحترافية بمستشعر 33 ميجابكسل وتصوير فيديو سينمائي 4K 60p.",
      tags: ["sony", "camera", "mirrorless"],
      reviews: [{ rating: 5, comment: "Incredible auto-focus" }]
    },
    {
      sku: "SFW-EL-007",
      title: "Dell XPS 16 OLED (Intel Core Ultra 9, 32GB RAM, 1TB SSD)",
      name: "Dell XPS 16 OLED (Intel Core Ultra 9, 32GB RAM, 1TB SSD)",
      parent: "Computers & Laptops",
      children: "Gaming Laptops",
      category: { name: "Computers & Laptops" },
      brand: { name: "Dell" },
      productType: "electronics",
      price: 2899,
      originalPrice: 3100,
      discount: 6,
      quantity: 18,
      unit: "pcs",
      status: "in-stock",
      featured: true,
      orderQuantity: 22,
      img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
      imageURLs: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"],
      description: "حاسوب محمول فائق الأداء بشاشة 4K OLED ومعالج الذكاء الاصطناعي الأحدث من إنتل.",
      tags: ["dell", "xps", "laptop"],
      reviews: [{ rating: 5, comment: "Stunning 4K screen" }]
    }
  ];

  for (const item of additionalProducts) {
    await productsColl.updateOne(
      { sku: item.sku },
      { $set: item },
      { upsert: true }
    );
  }
  console.log("✔ تم ربط منتجات الإلكترونيات بكل فئة وإضافة منتجات للساعات والكاميرات!");

  // 4. تصحيح الصور المكسورة لساعة أوميغا وسوار كارتييه
  await productsColl.updateOne(
    { sku: "SFW-JW-004" },
    {
      $set: {
        img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
        imageURLs: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"]
      }
    }
  );

  await productsColl.updateOne(
    { sku: "SFW-JW-003" },
    {
      $set: {
        img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
        imageURLs: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"]
      }
    }
  );
  console.log("✔ تم استبدال الصور المكسورة بصور مجوهرات وساعات عالية الدقة!");

  console.log("=================================================");
  console.log("🎉 تم اكتمال كل شيء بنجاح تام وبأعلى معايير الجودة!");
  console.log("=================================================");

  await mongoose.disconnect();
  process.exit(0);
}

runSuperFix();
