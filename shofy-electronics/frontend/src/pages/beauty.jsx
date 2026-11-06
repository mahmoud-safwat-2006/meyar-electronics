import React from "react";
import SEO from "@/components/seo";
import HeaderThree from "@/layout/headers/header-3";
import FooterTwo from "@/layout/footers/footer-2";
import BeautyBanner from "@/components/hero-banner/beauty-hero-banner";
import BeautyCategory from "@/components/categories/beauty-category";
import BeautyProducts from "@/components/products/beauty/beauty-products";

export default function Beauty() {
  return (
    <>
      <SEO pageTitle="Safwa Beauty - الجمال والعناية الطبيعية" />
      <HeaderThree />
      <main>
        <BeautyBanner />
        <BeautyCategory />
        <BeautyProducts />
      </main>
      <FooterTwo />
    </>
  );
}
