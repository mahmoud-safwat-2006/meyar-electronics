import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const translations = {
  en: {
    brand: "SAFWA", subBrand: "Enterprise Admin", overview: "Executive overview",
    products: "Products & inventory", orders: "Orders & logistics", staff: "Staff & roles",
    coupons: "Marketing & coupons", finance: "Finance & payouts", audit: "Security & audit",
    logout: "Sign out", searchPlaceholder: "Search products or orders...",
    connected: "Database connected", connecting: "Checking connection", disconnected: "Database unavailable",
    apiOffline: "API unavailable", database: "MongoDB", totalRevenue: "Gross order value",
    weeklyGrowth: "vs previous 7 days", totalOrders: "Total orders", deliveredOrders: "delivered",
    activeProducts: "Active catalog", totalCustomers: "New customers", conversionRate: "Conversion rate",
    recentOrders: "Live orders pipeline", status: "Status", pending: "Pending",
    processing: "Processing", shipped: "Shipped", delivered: "Delivered",
    cancelled: "Cancelled", returned: "Returned", allDepartments: "All sectors",
    electronics: "Electronics & tech", fashion: "Fashion & apparel", beauty: "Beauty & cosmetics",
    jewelry: "Jewelry & watches", home: "Home & living", groceries: "Supermarket & groceries",
    newProduct: "Add product",     newStaff: "Add staff account", newCoupon: "Create coupon",
    roleSuperAdmin: "Super admin", roleAdmin: "Administrator",
    roleOperations: "Operations manager", roleCatalog: "Catalog editor",
    roleFulfillment: "Fulfillment lead", roleSupport: "Support agent", roleAuditor: "Auditor",
    roleWarehouse: "Warehouse manager", roleLogistics: "Logistics officer",
    roleMarketing: "Marketing manager", roleFinance: "Finance manager",
    langToggle: "العربية", switchLangTip: "Switch to Arabic", liveStore: "Open storefront",
    loading: "Loading live data...", retry: "Try again", noData: "No records found.",
    search: "Search", allStatuses: "All statuses", actions: "Actions", customer: "Customer",
    sector: "Sector", amount: "Order value", date: "Date", phone: "Phone",
    address: "Delivery address", city: "City / governorate", quantity: "Quantity",
    price: "Price", stock: "Stock", product: "Product", sku: "SKU", category: "Category",
    inStock: "In stock", lowStock: "Low stock", outOfStock: "Out of stock",
    discontinued: "Inactive", active: "Active", inactive: "Inactive", edit: "Edit",
    delete: "Delete", save: "Save changes", cancel: "Cancel", close: "Close",
    expiry: "Expires", discount: "Discount", minimumAmount: "Minimum order",
    usage: "Uses", notTracked: "Not tracked", unknown: "Not recorded",
    created: "Created", joined: "Joined", role: "Role", email: "Email",
    password: "Temporary password", create: "Create", noPermission: "You do not have permission to access this page.",
    loginTitle: "Sign in to Safwa", loginDescription: "Use your administrator account to continue.",
    signIn: "Sign in", invalidLogin: "Invalid email or password.", serverTime: "Server time",
    refresh: "Refresh", live: "Live", pendingOrders: "Pending orders", completed: "Completed",
    productCount: "Products", salesValue: "Estimated item value", salesNotSettled: "Estimated from order item snapshots; not settled payments.",
    conversionUnavailable: "Not available: storefront sessions are not tracked.",
    financeNote: "Includes orders that are not cancelled or returned; settlement and payment status are not stored.",
    shipmentUnavailable: "Carrier, tracking number and waybill fields are not stored yet.",
    paymentUnavailable: "Payment transactions and payouts are not recorded by the current API.",
    supportUnavailable: "Support tickets and conversations are not part of the current data model.",
    invoice: "Invoice", printInvoice: "Print invoice", printWaybill: "Waybill unavailable",
    noLastLogin: "Last sign-in is not recorded", freeze: "Freeze account", activate: "Activate account",
    confirmDelete: "Delete this record? This cannot be undone.", saved: "Changes saved.",
    requiredFields: "Please complete all required fields.", details: "Details",
    sizes: "Sizes (comma separated)", colors: "Colors (comma separated)",
    specifications: "Specifications (one key: value per line)", productDescription: "Description",
    departmentFilter: "All sectors", stockFilter: "All inventory levels", clearFilters: "Clear filters",
    pagination: "Page", of: "of", previous: "Previous", next: "Next",
    orderLifecycleNote: "Only statuses supported by the current API can be updated. Shipping carrier and return workflows are not configured.",
    staffAccessNote: "Access is enforced on the API. This screen does not grant permissions by itself.",
    limitedRecords: "Showing the most recent records returned by the API.",
    alerts: "Alerts", workspace: "Workspace", workspaceName: "Safwa Store",
    mainMenu: "Main menu", operationsCenter: "Operations center", trend: "7-day change",
    departmentSales: "Department item sales", sectorCatalog: "Catalog by sector",
    sectionUnavailable: "No catalog records for this sector.", lowStockAlert: "Low stock",
    productForm: "Product details", staffForm: "Team member details", couponForm: "Coupon details",
    productUpdated: "Product updated.", productCreated: "Product created.",
    staffUpdated: "Staff account updated.", staffCreated: "Staff account created.",
    couponUpdated: "Coupon updated.", couponCreated: "Coupon created.", deleted: "Record deleted.",
    failed: "Request failed.", review: "Review required", searchNoResults: "No matching records.",
    phoneFilter: "Phone number", carrierFilter: "Carrier",
    shippingCompanyUnavailable: "Shipping carrier data is not available.",
    rolesLabel: "Access by role", theme: "Light executive",
    stockWarning: "Low stock threshold: 5 units.", moneyUnit: "USD",
    optionsUnavailable: "No active categories or brands are available. Add them before creating products.",
  },
  ar: {
    brand: "صَفْوَة", subBrand: "لوحة الإدارة التنفيذية", overview: "نظرة عامة تنفيذية",
    products: "المنتجات والمخزون", orders: "الطلبات والشحن", staff: "الفريق والصلاحيات",
    coupons: "التسويق والكوبونات", finance: "المالية والمدفوعات", audit: "الأمان وسجل التدقيق",
    logout: "تسجيل الخروج", searchPlaceholder: "ابحث عن المنتجات أو الطلبات...",
    connected: "قاعدة البيانات متصلة", connecting: "جارٍ التحقق من الاتصال", disconnected: "قاعدة البيانات غير متاحة",
    apiOffline: "الخادم غير متاح", database: "MongoDB", totalRevenue: "قيمة الطلبات الإجمالية",
    weeklyGrowth: "مقارنة بالأيام السبعة السابقة", totalOrders: "إجمالي الطلبات", deliveredOrders: "تم توصيلها",
    activeProducts: "المنتجات النشطة", totalCustomers: "العملاء الجدد", conversionRate: "معدل التحويل",
    recentOrders: "مسار الطلبات المباشر", status: "الحالة", pending: "قيد الانتظار",
    processing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التوصيل",
    cancelled: "ملغي", returned: "مرتجع", allDepartments: "جميع القطاعات",
    electronics: "الإلكترونيات والتقنية", fashion: "الأزياء والملابس", beauty: "التجميل والعناية",
    jewelry: "المجوهرات والساعات", home: "المنزل والمعيشة", groceries: "السوبرماركت والمؤن",
    newProduct: "إضافة منتج",     newStaff: "إضافة حساب موظف", newCoupon: "إنشاء كوبون",
    roleSuperAdmin: "مدير عام", roleAdmin: "مدير النظام",
    roleOperations: "مدير العمليات", roleCatalog: "مسؤول المنتجات",
    roleFulfillment: "مسؤول الشحن", roleSupport: "خدمة العملاء", roleAuditor: "مدقق مالي",
    roleWarehouse: "مدير المخازن", roleLogistics: "مسؤول الشحن والتوصيل",
    roleMarketing: "مدير التسويق", roleFinance: "مدير المالية",
    langToggle: "English", switchLangTip: "التبديل إلى الإنجليزية", liveStore: "عرض المتجر",
    loading: "جارٍ تحميل البيانات المباشرة...", retry: "إعادة المحاولة", noData: "لا توجد سجلات.",
    search: "بحث", allStatuses: "جميع الحالات", actions: "إجراءات", customer: "العميل",
    sector: "القطاع", amount: "قيمة الطلب", date: "التاريخ", phone: "الهاتف",
    address: "عنوان التوصيل", city: "المدينة / المحافظة", quantity: "الكمية",
    price: "السعر", stock: "المخزون", product: "المنتج", sku: "رمز SKU", category: "القسم",
    inStock: "متوفر", lowStock: "مخزون منخفض", outOfStock: "نفد المخزون",
    discontinued: "متوقف", active: "نشط", inactive: "غير نشط", edit: "تعديل",
    delete: "حذف", save: "حفظ التغييرات", cancel: "إلغاء", close: "إغلاق",
    expiry: "تاريخ الانتهاء", discount: "الخصم", minimumAmount: "الحد الأدنى للطلب",
    usage: "مرات الاستخدام", notTracked: "غير مسجل", unknown: "غير مسجل",
    created: "تاريخ الإنشاء", joined: "تاريخ الانضمام", role: "الدور الوظيفي", email: "البريد الإلكتروني",
    password: "كلمة مرور مؤقتة", create: "إنشاء", noPermission: "ليس لديك صلاحية الوصول إلى هذه الصفحة.",
    loginTitle: "تسجيل الدخول إلى صفوة", loginDescription: "استخدم حساب الإدارة للمتابعة.",
    signIn: "تسجيل الدخول", invalidLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", serverTime: "وقت الخادم",
    refresh: "تحديث", live: "مباشر", pendingOrders: "طلبات قيد الانتظار", completed: "مكتملة",
    productCount: "المنتجات", salesValue: "قيمة المنتجات التقديرية", salesNotSettled: "تقدير محسوب من عناصر الطلب المحفوظة، وليس مدفوعات مُحصّلة.",
    conversionUnavailable: "غير متاح: جلسات زوار المتجر غير مسجلة.",
    financeNote: "تشمل الطلبات غير الملغاة وغير المرتجعة؛ لا تُحفظ بيانات تسوية المدفوعات وحالتها.",
    shipmentUnavailable: "بيانات شركة الشحن ورقم التتبع وبوليصة الشحن غير محفوظة حاليًا.",
    paymentUnavailable: "واجهة API الحالية لا تسجل معاملات الدفع أو التحويلات المالية.",
    supportUnavailable: "نموذج البيانات الحالي لا يتضمن تذاكر الدعم أو المحادثات.",
    invoice: "الفاتورة", printInvoice: "طباعة الفاتورة", printWaybill: "بوليصة الشحن غير متاحة",
    noLastLogin: "وقت آخر دخول غير مسجل", freeze: "تجميد الحساب", activate: "تفعيل الحساب",
    confirmDelete: "هل تريد حذف هذا السجل؟ لا يمكن التراجع عن ذلك.", saved: "تم حفظ التغييرات.",
    requiredFields: "يرجى استكمال الحقول المطلوبة.", details: "التفاصيل",
    sizes: "المقاسات (مفصولة بفواصل)", colors: "الألوان (مفصولة بفواصل)",
    specifications: "المواصفات (خاصية: قيمة، كل سطر خاصية)", productDescription: "الوصف",
    departmentFilter: "كل القطاعات", stockFilter: "كل مستويات المخزون", clearFilters: "مسح الفلاتر",
    pagination: "صفحة", of: "من", previous: "السابق", next: "التالي",
    orderLifecycleNote: "تُحدّث الحالات التي تدعمها قاعدة البيانات فقط. لم تُجهّز بيانات الشحن والإرجاع بعد.",
    staffAccessNote: "يفرض الخادم الصلاحيات فعليًا؛ هذه الواجهة لا تمنح أي صلاحيات بحد ذاتها.",
    limitedRecords: "تعرض الصفحة أحدث السجلات التي أعادها الخادم.",
    alerts: "التنبيهات", workspace: "مساحة العمل", workspaceName: "متجر صفوة",
    mainMenu: "القائمة الرئيسية", operationsCenter: "مركز العمليات", trend: "التغير خلال 7 أيام",
    departmentSales: "قيمة المنتجات المباعة حسب القطاع", sectorCatalog: "الكتالوج حسب القطاع",
    sectionUnavailable: "لا توجد منتجات مسجلة في هذا القطاع.", lowStockAlert: "مخزون منخفض",
    productForm: "بيانات المنتج", staffForm: "بيانات الموظف", couponForm: "بيانات الكوبون",
    productUpdated: "تم تحديث المنتج.", productCreated: "تم إنشاء المنتج.",
    staffUpdated: "تم تحديث حساب الموظف.", staffCreated: "تم إنشاء حساب الموظف.",
    couponUpdated: "تم تحديث الكوبون.", couponCreated: "تم إنشاء الكوبون.", deleted: "تم حذف السجل.",
    failed: "تعذر تنفيذ الطلب.", review: "تتطلب مراجعة", searchNoResults: "لا توجد نتائج مطابقة.",
    phoneFilter: "رقم الهاتف", carrierFilter: "شركة الشحن",
    shippingCompanyUnavailable: "بيانات شركة الشحن غير متاحة.",
    rolesLabel: "الصلاحيات حسب الدور", theme: "المظهر التنفيذي",
    stockWarning: "تنبيه المخزون المنخفض: 5 قطع.", moneyUnit: "دولار أمريكي",
    optionsUnavailable: "لا توجد أقسام أو علامات تجارية نشطة. أضفها قبل إنشاء المنتجات.",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("safwa_admin_lang");
    if (saved === "en" || saved === "ar") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((current) => {
      const next = current === "en" ? "ar" : "en";
      window.localStorage.setItem("safwa_admin_lang", next);
      return next;
    });
  }, []);

  const t = useCallback((key) => translations[lang][key] || key, [lang]);
  const value = useMemo(() => ({ lang, dir: lang === "ar" ? "rtl" : "ltr", toggleLang, t }), [lang, t, toggleLang]);

  return (
    <LanguageContext.Provider value={value}>
      <div dir={value.dir} className={lang === "ar" ? "font-cairo" : "font-sans"}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLang must be used within LanguageProvider.");
  return context;
}
