const mongoose = require('mongoose');
const uri = 'mongodb+srv://shofy_admin:ShofyPass2026@cluster0.xgoa0sb.mongodb.net/shofy-electronics?retryWrites=true&w=majority';

async function updateStore() {
  console.log("🔄 جاري الاتصال وتحديث بيانات المتجر...");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // 1. إضافة الماركات العالمية (Brands)
  const brandsColl = db.collection('brands');
  await brandsColl.deleteMany({});
  await brandsColl.insertMany([
    { name: 'Apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100', status: 'active', email: 'apple@store.com', website: 'apple.com' },
    { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', status: 'active', email: 'samsung@store.com', website: 'samsung.com' },
    { name: 'Sony', logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100', status: 'active', email: 'sony@store.com', website: 'sony.com' },
    { name: 'Zara', logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100', status: 'active', email: 'zara@store.com', website: 'zara.com' },
    { name: 'Gucci', logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100', status: 'active', email: 'gucci@store.com', website: 'gucci.com' },
    { name: 'Dior', logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100', status: 'active', email: 'dior@store.com', website: 'dior.com' },
    { name: 'Chanel', logo: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=100', status: 'active', email: 'chanel@store.com', website: 'chanel.com' },
    { name: 'Rolex', logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100', status: 'active', email: 'rolex@store.com', website: 'rolex.com' },
    { name: 'Cartier', logo: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100', status: 'active', email: 'cartier@store.com', website: 'cartier.com' }
  ]);
  console.log("✅ تم تفعيل الماركات العالمية (Brands) بنجاح!");

  // 2. تحديث التقييمات والأقسام لكل المنتجات لتظهر في Top Rated
  const productsColl = db.collection('products');
  await productsColl.updateMany({}, {
    $set: {
      status: 'in-stock',
      featured: true,
      reviews: [{ rating: 5, comment: 'High quality & authentic!' }]
    }
  });
  console.log("✅ تم تفعيل أعلى التقييمات (Top Rated) لكل المنتجات!");
  console.log("🎉 كل بيانات المتجر أصبحت جاهزة 100%!");
  process.exit(0);
}

updateStore().catch((err) => {
  console.error("❌ خطأ:", err);
  process.exit(1);
});
