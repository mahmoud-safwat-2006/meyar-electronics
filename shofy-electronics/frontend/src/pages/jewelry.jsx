import React from "react";
import SEO from "@/components/seo";
import HeaderFour from "@/layout/headers/header-4";
import FooterThree from "@/layout/footers/footer-3";
import JewelryBanner from "@/components/hero-banner/jewelry-hero-banner";
import JewelryCategory from "@/components/categories/jewelry-category";
import JewelryProducts from "@/components/products/jewelry/jewelry-products";

export default function Jewelry() {
  return (
    <>
      <SEO pageTitle="Safwa Jewelry - الساعات والمجوهرات الفاخرة" />
      <HeaderFour />
      <main>
        <JewelryBanner />
        <JewelryCategory />
        <JewelryProducts />
      </main>
      <FooterThree />
    </>
  );
}
