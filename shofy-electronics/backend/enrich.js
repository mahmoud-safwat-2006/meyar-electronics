const mongoose = require("mongoose");

const uri = "mongodb+srv://shofy_admin:ShofyPass2026@cluster0.xgoa0sb.mongodb.net/shofy-electronics?retryWrites=true&w=majority";

async function enrich() {
  console.log("Connecting to MongoDB Atlas via Mongoose...");
  await mongoose.connect(uri);
  console.log("Connected successfully!");
  const db = mongoose.connection.db;

  // 1. إضافة الأقسام الأساسية (Categories) لمنع "No Category found!"
  const categoriesColl = db.collection("categories");
  const count = await categoriesColl.countDocuments();
  if (count === 0) {
    await categoriesColl.insertMany([
      { parent: "Electronics", productType: "electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400", status: "Show", children: ["Mobile", "Laptops", "Smart Watches", "Audio"] },
      { parent: "Fashion", productType: "fashion", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400", status: "Show", children: ["Men", "Women", "Shoes", "Bags"] },
      { parent: "Beauty", productType: "beauty", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", status: "Show", children: ["Skincare", "Makeup", "Fragrance"] },
      { parent: "Jewelry", productType: "jewelry", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", status: "Show", children: ["Watches", "Rings", "Diamonds"] },
      { parent: "Home & Kitchen", productType: "home", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400", status: "Show", children: ["Bedding", "Kitchenware", "Decor"] },
      { parent: "Supermarket", productType: "groceries", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400", status: "Show", children: ["Organic Honey", "Italian Coffee", "Chocolates"] }
    ]);
    console.log("✅ 6 Categories added successfully!");
  } else {
    console.log(`ℹ️ Categories collection already has ${count} categories.`);
  }

  // 2. تفعيل خصائص trending و featured على المنتجات لتظهر فوراً في الصفحة الرئيسية
  const productsColl = db.collection("products");
  const prodRes = await productsColl.updateMany(
    {},
    {
      $set: {
        status: "in-stock",
        productType: "electronics",
        featured: true,
        trending: true,
        discount: 15,
        offerDate: {
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    }
  );
  console.log(`✅ Products updated: ${prodRes.modifiedCount} items refreshed for homepage & deals!`);

  // 3. تصحيح صور الكوبونات
  const couponColl = db.collection("coupons");
  await couponColl.updateMany(
    {},
    {
      $set: {
        logo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200"
      }
    }
  );
  console.log("✅ Coupons logos updated successfully!");

  await mongoose.disconnect();
  console.log("\n🎉 All database enrichments completed successfully!\n");
}

enrich().catch(console.error);
