const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shofy_admin:ShofyPass2026@cluster0.xgoa0sb.mongodb.net/shofy-electronics?retryWrites=true&w=majority";

const realProducts = [
  // 1. الإلكترونيات والتقنية (Electronics & Tech)
  {
    sku: "SFW-EL-001",
    title: "Apple iPhone 16 Pro Max 256GB - Desert Titanium",
    name: "Apple iPhone 16 Pro Max 256GB - Desert Titanium",
    parent: "Electronics",
    children: "Smartphones",
    category: { name: "Electronics" },
    price: 1199,
    originalPrice: 1299,
    discount: 8,
    quantity: 35,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"],
    description: "شريحة A18 Pro، شاشة Super Retina XDR مقاس 6.9 بوصة، إطار تيتانيوم من الدرجة الخامسة.",
    tags: ["apple", "iphone", "flagship"]
  },
  {
    sku: "SFW-EL-002",
    title: "MacBook Pro 16\" M3 Max (36GB RAM, 1TB SSD) - Space Black",
    name: "MacBook Pro 16\" M3 Max (36GB RAM, 1TB SSD) - Space Black",
    parent: "Electronics",
    children: "Laptops",
    category: { name: "Electronics" },
    price: 3499,
    originalPrice: 3699,
    discount: 5,
    quantity: 14,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"],
    description: "أقوى حاسوب محمول للمحترفين، شاشة Liquid Retina XDR، وأداء استثنائي للذكاء الاصطناعي والمونتاج.",
    tags: ["apple", "macbook", "m3 max"]
  },
  {
    sku: "SFW-EL-003",
    title: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    name: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    parent: "Electronics",
    children: "Audio",
    category: { name: "Electronics" },
    price: 398,
    originalPrice: 420,
    discount: 5,
    quantity: 48,
    unit: "pcs",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
    description: "عزل ضوضاء رائد عالمياً، صوت عالي الدقة Hi-Res، وعمر بطارية يصل إلى 30 ساعة.",
    tags: ["sony", "audio", "headphones"]
  },
  {
    sku: "SFW-EL-004",
    title: "iPad Pro 13\" M4 Ultra Thin OLED 256GB - Silver",
    name: "iPad Pro 13\" M4 Ultra Thin OLED 256GB - Silver",
    parent: "Electronics",
    children: "Tablets",
    category: { name: "Electronics" },
    price: 1299,
    originalPrice: 1399,
    discount: 7,
    quantity: 20,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"],
    description: "أنحف جهاز صنعته آبل بسمك 5.1 مم، مع شاشة Tandem OLED ثورية وشريحة M4 الخارقة.",
    tags: ["apple", "ipad", "tablet"]
  },

  // 2. الأزياء والملابس (Fashion & Apparel)
  {
    sku: "SFW-FA-001",
    title: "Italian Slim Fit Wool Tailored Suit - Midnight Navy",
    name: "Italian Slim Fit Wool Tailored Suit - Midnight Navy",
    parent: "Fashion",
    children: "Men's Suits",
    category: { name: "Fashion" },
    price: 450,
    originalPrice: 580,
    discount: 22,
    quantity: 26,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"],
    description: "بدلة إيطالية فاخرة من الصوف الصافي 100%، خياطة يدوية دقيقة للمناسبات الرسمية.",
    tags: ["suit", "wool", "men"]
  },
  {
    sku: "SFW-FA-002",
    title: "Pure Mulberry Silk Evening Gown - Emerald Green",
    name: "Pure Mulberry Silk Evening Gown - Emerald Green",
    parent: "Fashion",
    children: "Dresses",
    category: { name: "Fashion" },
    price: 380,
    originalPrice: 490,
    discount: 22,
    quantity: 15,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80"],
    description: "فستان سهرة مصنوع من حرير التوت الطبيعي 100% بلون أخضر زمردي ملكي ينسدل بأناقة.",
    tags: ["dress", "silk", "women"]
  },
  {
    sku: "SFW-FA-003",
    title: "Handcrafted Calfskin Leather Chelsea Boots - Cognac",
    name: "Handcrafted Calfskin Leather Chelsea Boots - Cognac",
    parent: "Fashion",
    children: "Footwear",
    category: { name: "Fashion" },
    price: 220,
    originalPrice: 280,
    discount: 21,
    quantity: 30,
    unit: "pairs",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80"],
    description: "حذاء تشيلسي مصنوع يدوياً من جلد العجل الطبيعي مع نعل مطاطي مريح وفائق الأناقة.",
    tags: ["boots", "leather", "chelsea"]
  },
  {
    sku: "SFW-FA-004",
    title: "Pure Mongolian Cashmere Crewneck Sweater - Sand",
    name: "Pure Mongolian Cashmere Crewneck Sweater - Sand",
    parent: "Fashion",
    children: "Knitwear",
    category: { name: "Fashion" },
    price: 195,
    originalPrice: 240,
    discount: 18,
    quantity: 40,
    unit: "pcs",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"],
    description: "كنزة شتوية فاخرة مصنوعة من أنعم خيوط الكشمير المنغولي لدفء استثنائي.",
    tags: ["cashmere", "sweater"]
  },

  // 3. التجميل والعناية (Beauty & Cosmetics)
  {
    sku: "SFW-BT-001",
    title: "Maison Francis Kurkdjian Baccarat Rouge 540 Extrait (70ml)",
    name: "Maison Francis Kurkdjian Baccarat Rouge 540 Extrait (70ml)",
    parent: "Beauty",
    children: "Perfumes",
    category: { name: "Beauty" },
    price: 435,
    originalPrice: 475,
    discount: 8,
    quantity: 18,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"],
    description: "العطر النيش الأيقوني المركز، يجمع بين نفحات الزعفران والعنبر الخشبي وخشب الأرز.",
    tags: ["perfume", "baccarat", "fragrance"]
  },
  {
    sku: "SFW-BT-002",
    title: "Dior Sauvage Elixir Eau de Parfum - 60ml",
    name: "Dior Sauvage Elixir Eau de Parfum - 60ml",
    parent: "Beauty",
    children: "Men's Fragrance",
    category: { name: "Beauty" },
    price: 185,
    originalPrice: 210,
    discount: 11,
    quantity: 50,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"],
    description: "عطر رجالي قوي مع نفحات توابل دافئة وخلاصة اللافندر المقطرة لدار ديور.",
    tags: ["dior", "sauvage"]
  },
  {
    sku: "SFW-BT-003",
    title: "Estée Lauder Advanced Night Repair Synchronized Serum 50ml",
    name: "Estée Lauder Advanced Night Repair Synchronized Serum 50ml",
    parent: "Beauty",
    children: "Skincare",
    category: { name: "Beauty" },
    price: 125,
    originalPrice: 145,
    discount: 13,
    quantity: 60,
    unit: "pcs",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"],
    description: "سيروم العناية الليلية لمكافحة علامات التقدم بالسن وتجديد إشراقة ونضارة البشرة.",
    tags: ["skincare", "serum"]
  },
  {
    sku: "SFW-BT-004",
    title: "Dyson Airwrap Multi-Styler Complete Long - Nickel/Copper",
    name: "Dyson Airwrap Multi-Styler Complete Long - Nickel/Copper",
    parent: "Beauty",
    children: "Hair Tools",
    category: { name: "Beauty" },
    price: 599,
    originalPrice: 650,
    discount: 8,
    quantity: 12,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"],
    description: "مصفف الشعر بتقنية كواندا الهوائية دون حرارة مفرطة لحماية صحة الشعر ولمعانه.",
    tags: ["dyson", "airwrap"]
  },

  // 4. المجوهرات والساعات (Jewelry & Watches)
  {
    sku: "SFW-JW-001",
    title: "Rolex Submariner Date 41mm Oystersteel - Black Dial",
    name: "Rolex Submariner Date 41mm Oystersteel - Black Dial",
    parent: "Jewelry",
    children: "Luxury Watches",
    category: { name: "Jewelry" },
    price: 14200,
    originalPrice: 15500,
    discount: 8,
    quantity: 3,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"],
    description: "ساعة الغوص المعيارية من رولكس بعيار 3235، إطار سيراميك Cerachrom، ومقاومة ماء حتى 300 متر.",
    tags: ["rolex", "luxury", "watch"]
  },
  {
    sku: "SFW-JW-002",
    title: "18K White Gold Round Brilliant Diamond Solitaire Ring (1.50ct)",
    name: "18K White Gold Round Brilliant Diamond Solitaire Ring (1.50ct)",
    parent: "Jewelry",
    children: "Diamond Rings",
    category: { name: "Jewelry" },
    price: 4950,
    originalPrice: 5600,
    discount: 11,
    quantity: 5,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"],
    description: "خاتم سوليتير ماسي طبيعي حاصل على شهادة GIA، نرجسي النقاء مثبت على ذهب أبيض عيار 18.",
    tags: ["diamond", "ring", "gold"]
  },
  {
    sku: "SFW-JW-003",
    title: "Cartier Love Bracelet - 18K Yellow Gold (Classic Size 17)",
    name: "Cartier Love Bracelet - 18K Yellow Gold (Classic Size 17)",
    parent: "Jewelry",
    children: "Bracelets",
    category: { name: "Jewelry" },
    price: 7350,
    originalPrice: 7900,
    discount: 7,
    quantity: 4,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1611591475870-07bfd96d2780?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1611591475870-07bfd96d2780?auto=format&fit=crop&w=800&q=80"],
    description: "سوار الحب الأسطوري من دار كارتييه، الرمز الخالد برسم البراغي الشهيرة وقفل الذهب النقي.",
    tags: ["cartier", "love", "bracelet"]
  },
  {
    sku: "SFW-JW-004",
    title: "Omega Speedmaster Professional Moonwatch Co-Axial 42mm",
    name: "Omega Speedmaster Professional Moonwatch Co-Axial 42mm",
    parent: "Jewelry",
    children: "Chronograph",
    category: { name: "Jewelry" },
    price: 7600,
    originalPrice: 8200,
    discount: 7,
    quantity: 6,
    unit: "pcs",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=800&q=80"],
    description: "ساعة مون ووتش الأسطورية المعتمدة من ناسا، بعيار أوميغا الماستر كرونومتر 3861.",
    tags: ["omega", "moonwatch"]
  },

  // 5. المنزل والمعيشة (Home & Living)
  {
    sku: "SFW-HM-001",
    title: "De'Longhi Magnifica S Smart Automatic Bean-to-Cup Espresso Machine",
    name: "De'Longhi Magnifica S Smart Automatic Bean-to-Cup Espresso Machine",
    parent: "Home",
    children: "Coffee Machines",
    category: { name: "Home" },
    price: 680,
    originalPrice: 780,
    discount: 12,
    quantity: 22,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80"],
    description: "ماكينة قهوة إيطالية ذكية تطحن حبوب البن الطازجة لكل كوب برغوة حليب كريمية غنية.",
    tags: ["coffee", "delonghi", "espresso"]
  },
  {
    sku: "SFW-HM-002",
    title: "Dyson V15 Detect Absolute Cordless Smart Vacuum Cleaner",
    name: "Dyson V15 Detect Absolute Cordless Smart Vacuum Cleaner",
    parent: "Home",
    children: "Appliances",
    category: { name: "Home" },
    price: 749,
    originalPrice: 849,
    discount: 11,
    quantity: 18,
    unit: "pcs",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80"],
    description: "مكنسة دايسون اللاسلكية المزودة بشعاع ليزر يكشف الغبار الدقيق ومستشعر بيزو لقياس جزيئات الأتربة.",
    tags: ["dyson", "vacuum"]
  },
  {
    sku: "SFW-HM-003",
    title: "Philips Airfryer XXL Smart Sensing Premium 1.4kg (Black/Copper)",
    name: "Philips Airfryer XXL Smart Sensing Premium 1.4kg (Black/Copper)",
    parent: "Home",
    children: "Kitchen",
    category: { name: "Home" },
    price: 299,
    originalPrice: 350,
    discount: 14,
    quantity: 34,
    unit: "pcs",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80"],
    description: "قلاية فيليبس الهوائية سعة عائلية مع تقنية إزالة الدهون وبرامج ذكية لطهي صحي ومقرمش.",
    tags: ["philips", "airfryer"]
  },
  {
    sku: "SFW-HM-004",
    title: "100% Egyptian Giza Cotton 1000-Thread-Count Luxury Bedding Set",
    name: "100% Egyptian Giza Cotton 1000-Thread-Count Luxury Bedding Set",
    parent: "Home",
    children: "Bedding",
    category: { name: "Home" },
    price: 180,
    originalPrice: 240,
    discount: 25,
    quantity: 50,
    unit: "sets",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80"],
    description: "طقم مفروشات سرير فاخر منسوج من قطن جيزة المصري طويل التيلة بكثافة 1000 خيط.",
    tags: ["cotton", "bedding"]
  },

  // 6. السوبرماركت والمؤن (Supermarket & Groceries)
  {
    sku: "SFW-GR-001",
    title: "Sinai Organic Extra Virgin Cold-Pressed Olive Oil 1L",
    name: "Sinai Organic Extra Virgin Cold-Pressed Olive Oil 1L",
    parent: "Supermarket",
    children: "Oils & Vinegars",
    category: { name: "Supermarket" },
    price: 24,
    originalPrice: 30,
    discount: 20,
    quantity: 120,
    unit: "bottle",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80"],
    description: "زيت زيتون بكر ممتاز معصور على البارد من مزارع سيناء الطبيعية، خالي من أي إضافات.",
    tags: ["olive oil", "organic"]
  },
  {
    sku: "SFW-GR-002",
    title: "Lavazza Qualità Oro 100% Arabica Whole Coffee Beans 1kg",
    name: "Lavazza Qualità Oro 100% Arabica Whole Coffee Beans 1kg",
    parent: "Supermarket",
    children: "Coffee & Tea",
    category: { name: "Supermarket" },
    price: 32,
    originalPrice: 38,
    discount: 15,
    quantity: 85,
    unit: "pack",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"],
    description: "حبوب بن إيطالية ذهبية مختارة من حبوب الأرابيكا الصافية بنكهة زهرية وعطرية متوازنة.",
    tags: ["coffee", "lavazza"]
  },
  {
    sku: "SFW-GR-003",
    title: "Raw Mountain Sidr Honey 100% Pure & Unpasteurized 500g",
    name: "Raw Mountain Sidr Honey 100% Pure & Unpasteurized 500g",
    parent: "Supermarket",
    children: "Honey & Jams",
    category: { name: "Supermarket" },
    price: 65,
    originalPrice: 80,
    discount: 18,
    quantity: 45,
    unit: "jar",
    status: "in-stock",
    featured: true,
    img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"],
    description: "عسل سدر جبلي خام نقي من أزهار شجر السدر، غني بالإنزيمات والمناعة الطبيعية.",
    tags: ["honey", "sidr"]
  },
  {
    sku: "SFW-GR-004",
    title: "Ferrero Rocher Golden Prestige Chocolate Gift Box 42 Pieces",
    name: "Ferrero Rocher Golden Prestige Chocolate Gift Box 42 Pieces",
    parent: "Supermarket",
    children: "Confectionery",
    category: { name: "Supermarket" },
    price: 42,
    originalPrice: 48,
    discount: 12,
    quantity: 70,
    unit: "box",
    status: "in-stock",
    featured: false,
    img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
    imageURLs: ["https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80"],
    description: "شوكولاتة فيريرو روشيه الذهبية بحشوة البندق الكامل وكريمة الكاكاو الناعمة.",
    tags: ["chocolate", "ferrero"]
  }
];

const sampleOrders = [
  {
    orderId: "SFW-9401",
    customer: "Ahmed El-Sayed",
    email: "ahmed.sayed@gmail.com",
    phone: "+20 100 234 5678",
    address: "Zamalek, 26th July St, Cairo",
    totalAmount: 1649,
    status: "processing",
    paymentMethod: "Card / Stripe",
    items: [
      { title: "Apple iPhone 16 Pro Max 256GB - Desert Titanium", quantity: 1, price: 1199 },
      { title: "Italian Slim Fit Wool Tailored Suit", quantity: 1, price: 450 }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 35)
  },
  {
    orderId: "SFW-9402",
    customer: "Sarah Mansour",
    email: "sarah.m@gmail.com",
    phone: "+20 122 890 1234",
    address: "Palm Hills, Sheikh Zayed, Giza",
    totalAmount: 620,
    status: "shipped",
    paymentMethod: "Cash on Delivery",
    items: [
      { title: "Maison Francis Kurkdjian Baccarat Rouge 540", quantity: 1, price: 435 },
      { title: "Dior Sauvage Elixir Eau de Parfum", quantity: 1, price: 185 }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 180)
  },
  {
    orderId: "SFW-9403",
    customer: "Omar Farooq",
    email: "omar.f@outlook.com",
    phone: "+20 111 456 7890",
    address: "Gleem, Alexandria",
    totalAmount: 14200,
    status: "delivered",
    paymentMethod: "Bank Wire Transfer",
    items: [
      { title: "Rolex Submariner Date 41mm Oystersteel", quantity: 1, price: 14200 }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    orderId: "SFW-9404",
    customer: "Dina Raouf",
    email: "dina.raouf@yahoo.com",
    phone: "+20 102 987 6543",
    address: "Nasr City, Makram Ebeid, Cairo",
    totalAmount: 121,
    status: "pending",
    paymentMethod: "Card / Stripe",
    items: [
      { title: "Sinai Organic Extra Virgin Olive Oil 1L", quantity: 2, price: 24 },
      { title: "Raw Mountain Sidr Honey 500g", quantity: 1, price: 65 },
      { title: "Lavazza Qualità Oro Whole Coffee Beans", quantity: 1, price: 32 }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 15)
  }
];

const sampleCoupons = [
  { title: "SAFWA2026", logo: "https://i.ibb.co/6800000/safwa.png", couponCode: "SAFWA2026", discountPercentage: 15, minimumAmount: 100, endTime: new Date("2026-12-31"), status: "active" },
  { title: "VIPMEMBER", logo: "https://i.ibb.co/6800000/safwa.png", couponCode: "VIPMEMBER", discountPercentage: 20, minimumAmount: 500, endTime: new Date("2026-12-31"), status: "active" }
];

async function seed() {
  console.log("=================================================");
  console.log("🚀 جاري الاتصال بقاعدة بيانات MongoDB Atlas...");
  console.log("=================================================");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✔ تم الاتصال بنجاح بـ MongoDB Atlas Cluster0!");

    const db = mongoose.connection.db;

    // 1. حقن المنتجات
    const productsColl = db.collection('products');
    await productsColl.deleteMany({});
    const resProducts = await productsColl.insertMany(realProducts);
    console.log(`✔ تم حقن ${resProducts.insertedCount} منتج حقيقي في جدول products عبر القطاعات الستة!`);

    // 2. حقن الطلبات
    const ordersColl = db.collection('orders');
    await ordersColl.deleteMany({});
    const resOrders = await ordersColl.insertMany(sampleOrders);
    console.log(`✔ تم حقن ${resOrders.insertedCount} طلبات في جدول orders!`);

    // 3. حقن الكوبونات
    const couponsColl = db.collection('coupons');
    await couponsColl.deleteMany({});
    const resCoupons = await couponsColl.insertMany(sampleCoupons);
    console.log(`✔ تم حقن ${resCoupons.insertedCount} كوبونات في جدول coupons!`);

    console.log("=================================================");
    console.log("🎉 مبروك! قاعدة البيانات في سيرفر Mongo امتلأت بالبيانات الحقيقية!");
    console.log("=================================================");

  } catch (err) {
    console.error("❌ خطأ أثناء الاتصال:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
