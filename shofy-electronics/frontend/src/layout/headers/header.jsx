import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

// internal
import Menus from "./header-com/menus";
import useSticky from "@/hooks/use-sticky";
import useCartInfo from "@/hooks/use-cart-info";
import OffCanvas from "@/components/common/off-canvas";
import { openCartMini } from "@/redux/features/cartSlice";
import HeaderCategory from "./header-com/header-category";
import HeaderTopRight from "./header-com/header-top-right";
import HeaderMainRight from "./header-com/header-main-right";
import CartMiniSidebar from "@/components/common/cart-mini-sidebar";
import HeaderSearchForm from "@/components/forms/header-search-form";
import { CartTwo, CategoryMenu, Compare, Menu, Phone, ShippingCar, Wishlist } from "@/svg";

// مسار الشعار
const logo = "/assets/img/logo/logo.svg";

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist || { wishlist: [] });
  const { quantity } = useCartInfo();
  const { sticky } = useSticky();

  const [isOffCanvasOpen, setIsCanvasOpen] = useState(false);
  
  // ✅ 1. تبدأ القائمة مغلقة دائماً عند فتح الموقع أو التحديث (false)
  const [isCategoryActive, setIsCategoryActive] = useState(false);
  const categoryMenuRef = useRef(null);

  // ✅ 2. إغلاق القائمة تلقائياً عند التنقل بين الصفحات
  useEffect(() => {
    setIsCategoryActive(false);
  }, [router.asPath]);

  // ✅ 3. إغلاق القائمة تلقائياً عند النقر في أي مكان خارجها (في جميع الصفحات بما فيها الرئيسية)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target)
      ) {
        setIsCategoryActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header>
        <div className="tp-header-area p-relative z-index-11">
          {/* header top start */}
          <div className="tp-header-top black-bg p-relative z-index-1 d-none d-md-block">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="tp-header-welcome d-flex align-items-center">
                    <span>
                      <ShippingCar />
                    </span>
                    <p className="mb-0 ml-10">
                      Enjoy free shipping on all orders over $99! Shop now and save on delivery costs.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="tp-header-top-right d-flex align-items-center justify-content-end">
                    <HeaderTopRight />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* header main start */}
          <div className="tp-header-main tp-header-sticky">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-xl-2 col-lg-2 col-md-4 col-6">
                  <div className="logo">
                    <Link href="/">
                      <Image 
                        src={logo} 
                        alt="logo" 
                        width={130} 
                        height={40} 
                        priority 
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </Link>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-7 d-none d-lg-block">
                  <div className="tp-header-search pl-70">
                    <HeaderSearchForm />
                  </div>
                </div>
                <div className="col-xl-4 col-lg-3 col-md-8 col-6">
                  <div className="tp-header-main-right d-flex align-items-center justify-content-end">
                    {/* حساب المستخدم + الأيقونات الفردية بدون تكرار */}
                    <div className="d-none d-xl-block">
                      <HeaderMainRight />
                    </div>
                    <div className="tp-header-action d-flex align-items-center ml-30">
                      {/* فتح السلة في الشاشات الصغيرة */}
                      <div className="tp-header-action-item d-lg-none">
                        <button
                          onClick={() => dispatch(openCartMini())}
                          type="button"
                          className="tp-header-action-btn cartmini-open-btn"
                          aria-label="Open Cart"
                        >
                          <CartTwo />
                          <span className="tp-header-action-badge">{quantity}</span>
                        </button>
                      </div>
                      <div className="tp-header-action-item tp-header-hamburger mr-20 d-xl-none">
                        <button
                          onClick={() => setIsCanvasOpen(true)}
                          type="button"
                          className="tp-offcanvas-open-btn"
                          aria-label="Open Mobile Menu"
                        >
                          <Menu />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* header bottom start */}
          <div className="tp-header-bottom tp-header-bottom-border d-none d-lg-block">
            <div className="container">
              <div className="tp-mega-menu-wrapper p-relative">
                <div className="row align-items-center">
                  {/* قسم التصنيفات (All Categories) */}
                  <div className="col-xl-3 col-lg-3">
                    <div
                      ref={categoryMenuRef}
                      className="tp-header-category tp-category-menu p-relative"
                      style={{ zIndex: 9999 }}
                    >
                      <button
                        onClick={() => setIsCategoryActive(!isCategoryActive)}
                        className="tp-category-menu-btn"
                        type="button"
                        style={{
                          outline: "none",
                          cursor: "pointer",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: "#0989FF",
                          color: "#ffffff",
                          padding: "12px 20px",
                          borderRadius: isCategoryActive ? "6px 6px 0 0" : "6px",
                          fontWeight: 600,
                          fontSize: "15px",
                          border: "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <CategoryMenu />
                          All Categories
                        </span>
                        <span>
                          <svg
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                              transform: isCategoryActive ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <path
                              d="M1 1L5 5L9 1"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>

                      {/* قائمة الأقسام المنسدلة - تظهر فقط عند النقر على الزر */}
                      {isCategoryActive && (
                        <div
                          className="tp-category-menu-content active"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            width: "100%",
                            zIndex: 99999,
                          }}
                        >
                          <HeaderCategory
                            categoryType="electronics"
                            isCategoryActive={isCategoryActive}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* القائمة الرئيسية (Menus) */}
                  <div className="col-xl-6 col-lg-6">
                    <div className="main-menu menu-style-1">
                      <nav className="tp-main-menu-content">
                        <Menus />
                      </nav>
                    </div>
                  </div>

                  {/* رقم الهاتف والخط الساخن */}
                  <div className="col-xl-3 col-lg-3">
                    <div className="tp-header-contact d-flex align-items-center justify-content-end">
                      <div className="tp-header-contact-icon">
                        <span>
                          <Phone />
                        </span>
                      </div>
                      <div className="tp-header-contact-content">
                        <h5>Hotline:</h5>
                        <p>
                          <a href="tel:+201067278154">+201067278154</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* sticky header start */}
      <div
        id="header-sticky-2"
        className={`tp-header-sticky-area ${sticky ? "header-sticky-2" : ""}`}
        style={
          sticky
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 999,
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 20px rgba(1, 15, 28, 0.08)",
                animation: "fadeInDown 0.3s ease",
              }
            : {}
        }
      >
        <div className="container">
          <div className="tp-mega-menu-wrapper p-relative">
            <div className="row align-items-center">
              <div className="col-xl-3 col-lg-3 col-md-3 col-6">
                <div className="logo">
                  <Link href="/">
                    <Image src={logo} alt="logo" width={120} height={35} priority />
                  </Link>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-6 d-none d-md-block">
                <div className="tp-header-sticky-menu main-menu menu-style-1">
                  <nav id="mobile-menu">
                    <Menus />
                  </nav>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-3 col-6">
                <div className="tp-header-action d-flex align-items-center justify-content-end ml-50">
                  <div className="tp-header-action-item d-none d-sm-block">
                    <Link href="/compare" className="tp-header-action-btn">
                      <Compare />
                    </Link>
                  </div>
                  <div className="tp-header-action-item d-none d-sm-block">
                    <Link href="/wishlist" className="tp-header-action-btn">
                      <Wishlist />
                      <span className="tp-header-action-badge">{wishlist.length}</span>
                    </Link>
                  </div>
                  <div className="tp-header-action-item">
                    <button
                      onClick={() => dispatch(openCartMini())}
                      type="button"
                      className="tp-header-action-btn cartmini-open-btn"
                      aria-label="Open Cart"
                    >
                      <CartTwo />
                      <span className="tp-header-action-badge">{quantity}</span>
                    </button>
                  </div>
                  <div className="tp-header-action-item tp-header-hamburger mr-20 d-xl-none">
                    <button
                      onClick={() => setIsCanvasOpen(true)}
                      type="button"
                      className="tp-offcanvas-open-btn"
                      aria-label="Open Mobile Menu"
                    >
                      <Menu />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* cart mini sidebar */}
      <CartMiniSidebar />

      {/* off canvas */}
      <OffCanvas
        isOffCanvasOpen={isOffCanvasOpen}
        setIsCanvasOpen={setIsCanvasOpen}
        categoryType="electronics"
      />
    </>
  );
};

export default Header;