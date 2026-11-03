const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shofy_admin:ShofyPass2026@cluster0.xgoa0sb.mongodb.net/shofy-electronics?retryWrites=true&w=majority";

async function runSuperFix() {
  console.log("==================================================");
  console.log("⚡ جاري تحديث بيانات الأقسام والصور المكسورة...");
  console.log("==================================================");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  // 1. تصحيح صور المجوهرات والساعات المكسورة
  const productsColl = db.collection("products");
  await productsColl.updateOne(
    { sku: "SFW-JW-003" },
    { 
      $set: { 
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
      } 
    }
  );
  await productsColl.updateOne(
    { sku: "SFW-JW-004" },
    { 
      $set: { 
        img: "https://images.unsplash.com/photo-1611591475852-51a44c4b693e?w=600&auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1611591475852-51a44c4b693e?w=600&auto=format&fit=crop&q=80"
      } 
    }
  );
  console.log("✅ تم تصحيح صور Cartier و Omega بروابط عالية الجودة وعاملة!");

  // 2. ضمان وجود أقسام Fashion, Beauty, Jewelry لتظهر في المتاجر الثلاثة
  const categoriesColl = db.collection("categories");
  const defaultCategories = [
    // Fashion
    { parent: "Men's Clothing", productType: "fashion", img: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400", status: "Show", children: ["Shirts", "Suits", "Jeans"] },
    { parent: "Women's Clothing", productType: "fashion", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400", status: "Show", children: ["Dresses", "Tops", "Skirts"] },
    { parent: "Footwear & Shoes", productType: "fashion", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", status: "Show", children: ["Sneakers", "Formal", "Boots"] },
    
    // Beauty
    { parent: "Skincare", productType: "beauty", img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", status: "Show", children: ["Serums", "Moisturizers", "Cleansers"] },
    { parent: "Makeup & Cosmetics", productType: "beauty", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", status: "Show", children: ["Lipstick", "Foundation", "Mascara"] },
    { parent: "Fragrances & Perfumes", productType: "beauty", img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400", status: "Show", children: ["Men Perfumes", "Women Perfumes", "Oud"] },
    
    // Jewelry
    { parent: "Luxury Watches", productType: "jewelry", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400", status: "Show", children: ["Automatic", "Chronograph", "Gold Watches"] },
    { parent: "Diamond Rings", productType: "jewelry", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400", status: "Show", children: ["Solitaire", "Eternity", "Wedding Bands"] },
    { parent: "Gold Bracelets & Necklaces", productType: "jewelry", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", status: "Show", children: ["18K Gold", "24K Gold", "Bangles"] }
  ];

  for (const cat of defaultCategories) {
    await categoriesColl.updateOne(
      { parent: cat.parent, productType: cat.productType },
      { $set: cat },
      { upsert: true }
    );
  }
  console.log("✅ تم إضافة وتحديث أقسام الأزياء والتجميل والمجوهرات بنجاح!");

  // 3. تصحيح ADMIN_URL في بيئة العمل
  console.log("💡 تذكير: تأكد من تعديل ADMIN_URL=http://localhost:3001 داخل backend/.env");

  await mongoose.disconnect();
  console.log("🎉 اكتمل التحديث بنجاح!");
}

runSuperFix().catch(console.error);
