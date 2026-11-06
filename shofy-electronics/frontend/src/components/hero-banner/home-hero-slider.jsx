import React, { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper";
import { ArrowRightLong, SliderNextBtn, SliderPrevBtn } from "@/svg";

// إعدادات وبيانات السلايدات الثلاثة المطابقة تماماً لصور shofy.botble.com
const slider_data = [
  {
    id: 1,
    pre_title: { text: "Starting at", price: "274.00" },
    title: "The best tablet Collection 2023",
    subtitle: {
      text_1: "Exclusive offer",
      percent: "-35%",
      text_2: "off this week",
    },
    img: "https://shofy.botble.com/storage/main/sliders/slider-1.png",
    bg_color: "#115061",
    is_light: false,
    badge: null,
  },
  {
    id: 2,
    pre_title: { text: "Starting at", price: "999.00" },
    title: "The best note book collection 2023",
    subtitle: {
      text_1: "Exclusive offer",
      percent: "-10%",
      text_2: "off this week",
    },
    img: "https://shofy.botble.com/storage/main/sliders/slider-3.png",
    bg_color: "#115061",
    is_light: false,
    badge: null,
  },
  {
    id: 3,
    pre_title: { text: "Starting at", price: "999.00" },
    title: "The best phone collection 2023",
    subtitle: {
      text_1: "Exclusive offer",
      percent: "-10%",
      text_2: "off this week",
    },
    img: "https://shofy.botble.com/storage/main/sliders/slider-2.png",
    bg_color: "#ebf4f5",
    is_light: true,
    
  },
];

const HomeHeroSlider = () => {
  const [loop, setLoop] = useState(true);

  return (
    <>
      <section className="tp-slider-area p-relative z-index-1" style={{ overflow: "hidden", marginBottom: 0 }}>
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          loop={loop}
          effect="fade"
          autoplay={{
            delay: 5500,
            disableOnInteraction: false,
          }}
          modules={[Navigation, Pagination, EffectFade, Autoplay]}
          navigation={{
            nextEl: ".tp-slider-button-next",
            prevEl: ".tp-slider-button-prev",
          }}
          pagination={{
            el: ".tp-slider-dot",
            clickable: true,
          }}
          className="tp-slider-active tp-slider-variation"
        >
          {slider_data.map((item) => (
            <SwiperSlide key={item.id}>
              <div
                className={`tp-slider-item tp-slider-height d-flex align-items-center ${
                  item.is_light ? "is-light" : ""
                }`}
                style={{
                  backgroundColor: item.bg_color,
                  minHeight: "640px",
                  paddingTop: "90px",
                  paddingBottom: "80px",
                  position: "relative",
                  transition: "background-color 0.5s ease",
                }}
              >
                {/* أشكال تزيينية عائمة */}
                <div className="tp-slider-shape d-none d-sm-block">
                  <img
                    className="tp-slider-shape-1"
                    src="/assets/img/slider/shape/shape-1.png"
                    alt="shape"
                    style={{ pointerEvents: "none" }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <img
                    className="tp-slider-shape-2"
                    src="/assets/img/slider/shape/shape-2.png"
                    alt="shape"
                    style={{ pointerEvents: "none" }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <img
                    className="tp-slider-shape-3"
                    src="/assets/img/slider/shape/shape-3.png"
                    alt="shape"
                    style={{ pointerEvents: "none" }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <img
                    className="tp-slider-shape-4"
                    src="/assets/img/slider/shape/shape-4.png"
                    alt="shape"
                    style={{ pointerEvents: "none" }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>

                <div className="container">
                  <div className="row align-items-center">
                    {/* عمود النصوص والزر */}
                    <div className="col-xl-5 col-lg-6 col-md-6">
                      <div className="tp-slider-content p-relative z-index-1">
                        <span
                          style={{
                            color: item.is_light ? "#55585b" : "#83b7b8",
                            fontSize: "16px",
                            fontWeight: "500",
                            marginBottom: "12px",
                            display: "block",
                          }}
                        >
                          {item.pre_title.text} <b style={{ color: item.is_light ? "#010f1c" : "#fff" }}>${item.pre_title.price}</b>
                        </span>

                        <h3
                          className="tp-slider-title"
                          style={{
                            fontSize: "58px",
                            lineHeight: "1.15",
                            color: item.is_light ? "#010f1c" : "#ffffff",
                            fontWeight: "700",
                            marginBottom: "20px",
                          }}
                        >
                          {item.title}
                        </h3>

                        <p
                          style={{
                            fontSize: "18px",
                            color: item.is_light ? "#55585b" : "#b0d1d2",
                            marginBottom: "35px",
                          }}
                        >
                          {item.subtitle.text_1}{" "}
                          <span
                            style={{
                              color: item.is_light ? "#ff182a" : "#ffd43b",
                              fontWeight: "700",
                            }}
                          >
                            {item.subtitle.percent}
                          </span>{" "}
                          {item.subtitle.text_2}
                        </p>

                        <div className="tp-slider-btn">
                          <Link
                            href="/shop"
                            className="tp-btn tp-btn-2 tp-btn-white"
                            style={{
                              backgroundColor: "#ffffff",
                              color: "#010f1c",
                              padding: "14px 34px",
                              borderRadius: "8px",
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
                            }}
                          >
                            Shop Now <ArrowRightLong />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* عمود صورة المنتج الكبيرة بارتفاع كامل بدون أي قص */}
                    <div className="col-xl-7 col-lg-6 col-md-6">
                      <div
                        className="tp-slider-thumb text-end p-relative"
                        style={{
                          height: "440px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        {/* بادج الخصم الدائري في سلايد الهواتف (انظر الصورة 5) */}
                        {item.badge && (
                          <div
                            style={{
                              position: "absolute",
                              top: "20px",
                              left: "30px",
                              zIndex: 10,
                              width: "74px",
                              height: "74px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
                              color: "#fff",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "800",
                              fontSize: "15px",
                              boxShadow: "0 10px 20px rgba(244,63,94,0.35)",
                              lineHeight: "1.1",
                              textAlign: "center",
                            }}
                          >
                            <span>-35%</span>
                            <span style={{ fontSize: "10px", fontWeight: "600" }}>OFF</span>
                          </div>
                        )}

                        <Link href="/shop" style={{ display: "inline-block", maxWidth: "100%", height: "100%" }}>
                          <img
                            src={item.img}
                            alt={item.title}
                            style={{
                              maxHeight: "430px",
                              maxWidth: "100%",
                              width: "auto",
                              height: "auto",
                              objectFit: "contain",
                              filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))",
                              transition: "transform 0.4s ease",
                            }}
                            onError={(e) => {
                              e.currentTarget.src = "/assets/img/slider/slider-img-1.png";
                            }}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* أزرار التنقل يمين ويسار */}
        <div className="tp-slider-arrow tp-swiper-arrow d-none d-lg-block">
          <button type="button" className="tp-slider-button-prev" aria-label="Previous Slide">
            <SliderPrevBtn />
          </button>
          <button type="button" className="tp-slider-button-next" aria-label="Next Slide">
            <SliderNextBtn />
          </button>
        </div>

        {/* نقاط الترقيم في أسفل السلايدر */}
        <div className="tp-slider-dot tp-swiper-dot"></div>
      </section>
    </>
  );
};

export default HomeHeroSlider;