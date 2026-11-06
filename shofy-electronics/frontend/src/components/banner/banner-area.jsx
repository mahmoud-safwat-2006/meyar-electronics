import React from "react";
import Link from "next/link";
// internal
import { ArrowRight } from "@/svg";
import banner_1 from "@assets/img/product/banner/product-banner-1.jpg";
import banner_2 from "@assets/img/product/banner/product-banner-2.jpg";

// عنصر البنر بارتفاع ثابت 260px طبق الأصل لـ shofy.botble.com
function BannerItem({ sm = false, bg, title, subtitle }) {
  // استخدام رابط الصورة بأمان
  const bgUrl = bg?.src ? bg.src : "https://shofy.botble.com/storage/main/banners/" + (sm ? "2.jpg" : "1.jpg");

  return (
    <div
      className={`tp-banner-item ${
        sm ? "tp-banner-item-sm" : ""
      } tp-banner-height p-relative mb-30 z-index-1 fix`}
      style={{
        height: "260px",
        maxHeight: "260px",
        minHeight: "260px",
        overflow: "hidden",
        borderRadius: "10px",
        position: "relative",
      }}
    >
      <div
        className="tp-banner-thumb include-bg transition-3"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "260px",
          width: "100%",
        }}
      ></div>

      <div
        className="tp-banner-content"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "35px",
          maxWidth: sm ? "300px" : "420px",
        }}
      >
        <span>{subtitle || (sm ? "Sale 35% off" : "Sale 20% off all store")}</span>

        <h3
          className="tp-banner-title"
          style={{
            fontSize: sm ? "24px" : "28px",
            lineHeight: "1.2",
            marginBottom: "15px",
          }}
        >
          <Link href="/shop">{title}</Link>
        </h3>

        <div className="tp-banner-btn">
          <Link href="/shop" className="tp-link-btn">
            Shop Now <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}

const BannerArea = () => {
  return (
    <section className="tp-banner-area pt-30 pb-30">
      <div className="container">
        <div className="row">
          <div className="col-xl-8 col-lg-7">
            <BannerItem
              bg={banner_1}
              title={<>Smartphone <br /> BLU G91 Pro 2022</>}
              subtitle="Sale 20% off all store"
            />
          </div>
          <div className="col-xl-4 col-lg-5">
            <BannerItem
              sm={true}
              bg={banner_2}
              title={<>HyperX Cloud II <br /> Wireless</>}
              subtitle="Sale 35% off"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerArea;