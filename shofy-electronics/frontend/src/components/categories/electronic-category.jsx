import React from "react";
import { useRouter } from "next/router";
import { useGetProductTypeCategoryQuery } from "@/redux/features/categoryApi";
import { useGetAllProductsQuery } from "@/redux/features/productApi";

// الأقسام الـ 5 الدائرية بالصور وروابط shofy.botble.com المباشرة
const fallback_categories = [
  {
    _id: "cat_headphones",
    name: "Headphones",
    parent: "Headphones",
    products_count: 4,
    img: "https://shofy.botble.com/storage/main/product-categories/1.png",
  },
  {
    _id: "cat_bluetooth",
    name: "With Bluetooth",
    parent: "With Bluetooth",
    products_count: 7,
    img: "https://shofy.botble.com/storage/main/product-categories/5.png",
  },
  {
    _id: "cat_mobile",
    name: "Mobile Phone",
    parent: "Mobile Phone",
    products_count: 6,
    img: "https://shofy.botble.com/storage/main/product-categories/2.png",
  },
  {
    _id: "cat_cpu",
    name: "CPU Heat Pipes",
    parent: "CPU Heat Pipes",
    products_count: 6,
    img: "https://shofy.botble.com/storage/main/product-categories/3.png",
  },
  {
    _id: "cat_watch",
    name: "Smart Watch",
    parent: "Smart Watch",
    products_count: 2,
    img: "https://shofy.botble.com/storage/main/product-categories/4.png",
  },
];

const ElectronicCategory = () => {
  const router = useRouter();
  const { data: categories } = useGetProductTypeCategoryQuery("electronics");
  const { data: allProductsData } = useGetAllProductsQuery();

  // حساب عدد المنتجات الحقيقي لكل قسم من قاعدة البيانات إن وُجدت
  const calculateCount = (catName, fallbackCount) => {
    if (allProductsData?.data && Array.isArray(allProductsData.data)) {
      const match = allProductsData.data.filter(
        (p) =>
          p.category?.name?.toLowerCase().trim() === catName.toLowerCase().trim() ||
          p.parent?.toLowerCase().trim() === catName.toLowerCase().trim()
      );
      if (match.length > 0) return match.length;
    }
    return fallbackCount;
  };

  // دمج الأقسام لضمان ظهور الـ 5 أقسام كاملة دائماً بدون دوائر رمادية فارغة
  const displayCategories = fallback_categories.map((fb) => {
    const apiMatch = categories?.result?.find(
      (c) => c.parent?.toLowerCase().trim() === fb.parent.toLowerCase().trim()
    );

    return {
      _id: apiMatch?._id || fb._id,
      name: apiMatch?.parent || fb.name,
      img: apiMatch?.img || fb.img,
      count: calculateCount(fb.name, fb.products_count),
    };
  });

  const handleCategoryRoute = (title) => {
    router.push(`/shop?category=${title.toLowerCase().replace("&", "").split(" ").join("-")}`);
  };

  return (
    <section className="tp-product-category pt-60 pb-15">
      <div className="container">
        <div className="row row-cols-xl-5 row-cols-lg-5 row-cols-md-3 row-cols-sm-2 row-cols-1 justify-content-center">
          {displayCategories.map((item) => (
            <div key={item._id} className="col">
              <div className="tp-product-category-item text-center mb-40">
                {/* الدائرة الحاضنة للصورة بنفس أبعاد ومظهر shofy.botble.com */}
                <div
                  className="tp-product-category-thumb fix"
                  onClick={() => handleCategoryRoute(item.name)}
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    backgroundColor: "#ecf2f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e1ecf4";
                    e.currentTarget.style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ecf2f7";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    style={{
                      maxHeight: "95px",
                      maxWidth: "85px",
                      objectFit: "contain",
                      transition: "transform 0.3s ease",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/assets/img/product/category/category-1.png";
                    }}
                  />
                </div>

                <div className="tp-product-category-content">
                  <h3
                    className="tp-product-category-title"
                    style={{
                      fontSize: "17px",
                      fontWeight: "700",
                      marginBottom: "4px",
                      color: "#010f1c",
                    }}
                  >
                    <a
                      onClick={() => handleCategoryRoute(item.name)}
                      style={{ cursor: "pointer", color: "inherit" }}
                    >
                      {item.name}
                    </a>
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#55585b",
                      margin: 0,
                    }}
                  >
                    {item.count} products
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ElectronicCategory;