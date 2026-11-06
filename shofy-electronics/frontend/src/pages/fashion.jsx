import React from "react";
import SEO from "@/components/seo";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import FashionBanner from "@/components/hero-banner/fashion-hero-banner";
import PopularProducts from "@/components/products/fashion/popular-products";
import ProductArea from "@/components/products/fashion/product-area";

export default function Fashion() {
  return (
    <>
      <SEO pageTitle="Meyar Fashion - متجر الأزياء والموضة الفاخرة" />
      <HeaderTwo />
      <main>
        <FashionBanner />
        <PopularProducts />
        <ProductArea />
      </main>
      <Footer />
    </>
  );
}
