const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://shofy_admin:ShofyPass2026@cluster0.xgoa0sb.mongodb.net/shofy-electronics?retryWrites=true&w=majority";

async function seedUnifiedMarketplace() {
  console.log("=================================================");
  console.log("🚀 جاري دمج مشاريع معيار وصفوة في MongoDB...");
  console.log("=================================================");

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  // 1. الأقسام الموحدة الشاملة (Categories)
  const categoriesColl = db.collection("categories");
  await categoriesColl.deleteMany({});
  await categoriesColl.insertMany([
    // Meyar Electronics
    { parent: "Electronics & Tech", productType: "electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", status: "Show", children: ["Audio & Headphones", "Laptops & Computers", "Smartphones", "Cameras"] },
    // Meyar Fashion
    { parent: "Luxury Fashion", productType: "fashion", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400", status: "Show", children: ["Men's Tuxedos", "Silk Gowns", "Italian Shoes", "Leather Bags"] },
    // Safwa Beauty
    { parent: "Beauty & Fragrance", productType: "beauty", img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400", status: "Show", children: ["Royal Oud & Perfumes", "Dyson Hair Care", "Anti-Aging Serums", "Cosmetics"] },
    // Safwa Jewelry
    { parent: "Watches & Fine Jewelry", productType: "jewelry", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400", status: "Show", children: ["Rolex & Swiss Watches", "18K Gold Necklaces", "Diamond Rings", "Bracelets"] },
    // Gourmet Grocery
    { parent: "Gourmet Grocery", productType: "grocery", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400", status: "Show", children: ["Organic Fruits", "Specialty Coffee", "Dry Fruits & Nuts"] }
  ]);
  console.log("✅ 1. تم حفظ جميع الأقسام الموحدة (Categories)");

  // 2. الماركات العالمية الموحدة (Brands)
  const brandsColl = db.collection("brands");
  await brandsColl.deleteMany({});
  await brandsColl.insertMany([
    { name: "Apple", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100", status: "active", email: "apple@store.com", website: "apple.com" },
    { name: "Sony", logo: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100", status: "active", email: "sony@store.com", website: "sony.com" },
    { name: "Rolex", logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100", status: "active", email: "rolex@store.com", website: "rolex.com" },
    { name: "Cartier", logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100", status: "active", email: "cartier@store.com", website: "cartier.com" },
    { name: "Dior", logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100", status: "active", email: "dior@store.com", website: "dior.com" },
    { name: "Gucci", logo: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100", status: "active", email: "gucci@store.com", website: "gucci.com" },
    { name: "Zara", logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=100", status: "active", email: "zara@store.com", website: "zara.com" },
    { name: "Dyson", logo: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=100", status: "active", email: "dyson@store.com", website: "dyson.com" }
  ]);
  console.log("✅ 2. تم حفظ الماركات العالمية (Brands)");

  // 3. منتجات المتاجر الأربعة الموحدة (Products)
  const productsColl = db.collection("products");
  await productsColl.deleteMany({});
  await productsColl.insertMany([
    // === معيار للإلكترونيات ===
    {
      title: "Audio-Technica ATH-M50x Professional Studio Headphones",
      sku: "MEY-AUD-50X",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      category: { name: "Electronics & Tech", id: "cat_elec" },
      productType: "electronics",
      price: 169.00,
      discount: 15,
      quantity: 50,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "Critically acclaimed sonic performance praised by top audio engineers."
    },
    {
      title: "Apple MacBook Pro 16 M3 Max - 64GB Unified Memory",
      sku: "MEY-APL-MBP16",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
      category: { name: "Electronics & Tech", id: "cat_elec" },
      productType: "electronics",
      price: 3499.00,
      discount: 5,
      quantity: 15,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "The ultimate pro laptop with extreme power and battery life."
    },

    // === صفوة للمجوهرات والساعات ===
    {
      title: "Rolex Submariner Date 41mm Oystersteel & Cerachrom",
      sku: "SAF-RLX-SUB41",
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
      category: { name: "Watches & Fine Jewelry", id: "cat_jewel" },
      productType: "jewelry",
      price: 14500.00,
      discount: 0,
      quantity: 5,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "Iconic luxury divers watch crafted with legendary Swiss precision."
    },
    {
      title: "Cartier 18K Yellow Gold Love Bracelet - Classic Bangle",
      sku: "SAF-CRT-LOVE18",
      img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
      category: { name: "Watches & Fine Jewelry", id: "cat_jewel" },
      productType: "jewelry",
      price: 7350.00,
      discount: 0,
      quantity: 8,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "A universal symbol of love and commitment, locked with a screwdriver."
    },

    // === صفوة للعطور والتجميل ===
    {
      title: "Safwa Royal Cambodian Aged Agarwood Oud Perfume (100ml)",
      sku: "SAF-OUD-ROYAL",
      img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600",
      category: { name: "Beauty & Fragrance", id: "cat_beauty" },
      productType: "beauty",
      price: 320.00,
      discount: 10,
      quantity: 40,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "Rare aged Cambodian dehn al oud blended with taif rose and amber."
    },
    {
      title: "Dyson Airwrap Multi-Styler Complete Long - Nickel & Copper",
      sku: "SAF-DYS-AIRW",
      img: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600",
      category: { name: "Beauty & Fragrance", id: "cat_beauty" },
      productType: "beauty",
      price: 599.00,
      discount: 0,
      quantity: 20,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "Engineered for multiple hair types, styles without extreme heat."
    },

    // === معيار للأزياء والملابس الفاخرة ===
    {
      title: "Meyar Bespoke Italian Wool Tuxedo - Midnight Black",
      sku: "MEY-FSH-TUX",
      img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600",
      category: { name: "Luxury Fashion", id: "cat_fash" },
      productType: "fashion",
      price: 890.00,
      discount: 20,
      quantity: 25,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "Handcrafted from 100% Super 150s Italian wool with silk lapels."
    },
    {
      title: "Meyar Couture Silk Evening Gown - Emerald Green",
      sku: "MEY-FSH-GWN",
      img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600",
      category: { name: "Luxury Fashion", id: "cat_fash" },
      productType: "fashion",
      price: 650.00,
      discount: 10,
      quantity: 18,
      status: "in-stock",
      unit: "piece",
      featured: true,
      description: "Flowing pure mulberry silk gown tailored for red carpet galas."
    }
  ]);
  console.log("✅ 3. تم حفظ منتجات جميع المتاجر الأربعة (معيار وصفوة)");

  console.log("=================================================");
  console.log("🎉 تم دمج كل المنتجات والأقسام والماركات بنجاح!");
  console.log("=================================================");
  process.exit(0);
}

seedUnifiedMarketplace().catch(err => {
  console.error("❌ حدث خطأ:", err);
  process.exit(1);
});
