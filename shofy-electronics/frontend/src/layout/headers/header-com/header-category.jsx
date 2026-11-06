import React, { useState } from "react";
import { useRouter } from "next/router";

// قائمة الـ 11 فئة مطابقة 100% لقالب Shofy الأصلي
const SHOFY_CATEGORIES = [
  {
    id: 1,
    title: "New Arrivals",
    slug: "new-arrivals",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
      </svg>
    ),
    type: "link",
  },
  {
    id: 2,
    title: "Electronics",
    slug: "electronics",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" />
        <path d="M16 3l-4 4l-4 -4" />
      </svg>
    ),
    type: "mega-menu",
    megaMenu: [
      {
        title: "FEATURED",
        image: "https://shofy.botble.com/storage/main/product-categories/menu-1.jpg",
        items: [
          { name: "Featured", slug: "featured" },
          { name: "New Arrivals", slug: "new-arrivals" },
          { name: "Best Sellers", slug: "best-sellers" },
          { name: "Mobile Phone", slug: "mobile-phone" },
          { name: "Gaming Console", slug: "gaming-console", isSeparator: true },
        ],
      },
      {
        title: "COMPUTERS & LAPTOPS",
        image: "https://shofy.botble.com/storage/main/product-categories/menu-2.jpg",
        items: [
          { name: "Computers & Laptops", slug: "computers-laptops" },
          { name: "Top Brands", slug: "top-brands" },
          { name: "Weekly Best Selling", slug: "weekly-best-selling" },
          { name: "CPU Heat Pipes", slug: "cpu-heat-pipes" },
          { name: "CPU Coolers", slug: "cpu-coolers" },
          { name: "Playstation", slug: "playstation", isSeparator: true },
        ],
      },
      {
        title: "ACCESSORIES",
        image: "https://shofy.botble.com/storage/main/product-categories/menu-3.jpg",
        items: [
          { name: "Accessories", slug: "accessories" },
          { name: "Headphones", slug: "headphones" },
          { name: "Wireless Headphones", slug: "wireless-headphones" },
          { name: "TWS Earphones", slug: "tws-earphones" },
          { name: "Smart Watch", slug: "smart-watch" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Gifts",
    slug: "gifts",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1l0 -2" />
        <path d="M12 8l0 13" />
        <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5" />
      </svg>
    ),
    type: "link",
  },
  {
    id: 4,
    title: "Computers",
    slug: "computers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19l18 0" />
        <path d="M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8" />
      </svg>
    ),
    type: "submenu",
    submenu: [
      { name: "Desktop", slug: "desktop" },
      { name: "Laptop", slug: "laptop" },
      { name: "Tablet", slug: "tablet" },
      { name: "Accessories", slug: "accessories" },
    ],
  },
  {
    id: 5,
    title: "Smartphones & Tablets",
    slug: "smartphones-tablets",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14" />
        <path d="M11 4h2" />
        <path d="M12 17v.01" />
      </svg>
    ),
    type: "link",
  },
  {
    id: 6,
    title: "TV, Video & Music",
    slug: "tv-video-music",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" />
        <path d="M16 3l-4 4l-4 -4" />
      </svg>
    ),
    type: "link",
  },
  {
    id: 7,
    title: "Cameras",
    slug: "cameras",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
        <path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      </svg>
    ),
    type: "link",
  },
  {
    id: 8,
    title: "Cooking",
    slug: "cooking",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.2 10.2l6.3 6.3" />
        <path d="M19.347 16.575l1.08 1.079a1.96 1.96 0 0 1 -2.773 2.772l-1.08 -1.079a1.96 1.96 0 0 1 2.773 -2.772" />
        <path d="M3 7l3.05 3.15a2.9 2.9 0 0 0 4.1 -4.1l-3.15 -3.05l-4 4" />
      </svg>
    ),
    type: "link",
  },
  {
    id: 9,
    title: "Accessories",
    slug: "accessories",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l18 0" />
        <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" />
      </svg>
    ),
    type: "submenu",
    submenu: [
      { name: "With Bluetooth", slug: "with-bluetooth" },
    ],
  },
  {
    id: 10,
    title: "Sports",
    slug: "sports",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 7l4.76 3.45l-1.76 5.55h-6l-1.76 -5.55l4.76 -3.45" />
      </svg>
    ),
    type: "link",
  },
  {
    id: 11,
    title: "Electronics Gadgets",
    slug: "electronics-gadgets",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 6a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -12" />
        <path d="M8 10v-2h2m6 6v2h-2m-4 0h-2v-2m8 -4v-2h-2" />
      </svg>
    ),
    type: "submenu",
    submenu: [
      { name: "Micrscope", slug: "micrscope" },
      { name: "Remote Control", slug: "remote-control" },
      { name: "Monitor", slug: "monitor" },
      { name: "Thermometer", slug: "thermometer" },
      { name: "Backpack", slug: "backpack" },
      { name: "Headphones", slug: "headphones" },
    ],
  },
];

export default function HeaderCategory({ isCategoryActive }) {
  const router = useRouter();
  // حالة لتحديد أي عنصر يتم الوقوف عليه بالماوس فقط (الحل لمنع التداخل)
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const handleNavigate = (slug, isSub = false) => {
    if (isSub) {
      router.push(`/shop?subCategory=${slug}`);
    } else {
      router.push(`/shop?category=${slug}`);
    }
  };

  return (
    <ul
      className={isCategoryActive ? "active" : ""}
      onMouseLeave={() => setHoveredCategory(null)}
      style={{
        position: "absolute",
        top: isCategoryActive ? "100%" : "130%",
        left: 0,
        width: "100%",
        background: "#FFFFFF",
        boxShadow: "0px 1px 3px rgba(1, 15, 28, 0.1)",
        zIndex: 99,
        visibility: isCategoryActive ? "visible" : "hidden",
        opacity: isCategoryActive ? 1 : 0,
        transition: "all 0.3s ease-in-out",
        listStyle: "none",
        padding: "10px 0",
        margin: 0,
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {SHOFY_CATEGORIES.map((category) => {
        const hasChildren = category.type === "mega-menu" || category.type === "submenu";
        const isHovered = hoveredCategory === category.id;

        return (
          <li
            key={category.id}
            className="has-dropdown"
            onMouseEnter={() => setHoveredCategory(category.id)}
            style={{
              position: "relative",
              padding: "0 30px",
              listStyle: "none",
              backgroundColor: isHovered ? "#F8FAFD" : "transparent",
            }}
          >
            <a
              onClick={() => handleNavigate(category.slug)}
              className="cursor-pointer"
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: isHovered ? "#0989FF" : "#010F1C",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "13px 0 12px",
                borderBottom: "1px solid #EAEBED",
                transition: "all 0.2s ease",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: isHovered ? "#0989FF" : "#90969B",
                }}
              >
                {category.icon}
                <span style={{ color: isHovered ? "#0989FF" : "#010F1C", fontWeight: 500 }}>
                  {category.title}
                </span>
              </span>

              {hasChildren && (
                <svg
                  width="8"
                  height="12"
                  viewBox="0 0 8 12"
                  fill="none"
                  style={{ color: isHovered ? "#0989FF" : "#90969B" }}
                >
                  <path
                    d="M1.5 1.5L6.5 6L1.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </a>

            {/* 1. MEGA MENU لـ Electronics فقط عند وقوف الماوس عليها (isHovered) */}
            {isHovered && category.type === "mega-menu" && category.megaMenu && (
              <div
                className="tp-submenu mega-menu"
                onMouseEnter={() => setHoveredCategory(category.id)}
                style={{
                  position: "absolute",
                  left: "100%",
                  top: 0,
                  minWidth: "850px",
                  background: "#FFFFFF",
                  boxShadow: "0px 10px 30px rgba(1, 15, 28, 0.1)",
                  border: "1px solid #EAEBED",
                  borderRadius: "0 8px 8px 0",
                  padding: "24px 30px 30px",
                  zIndex: 100,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "30px",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {category.megaMenu.map((col, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#010F1C",
                        marginBottom: "12px",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {col.title}
                    </h4>

                    {col.image && (
                      <div
                        style={{
                          width: "100%",
                          height: "145px",
                          overflow: "hidden",
                          borderRadius: "4px",
                          marginBottom: "14px",
                          backgroundColor: "#f4f5f7",
                        }}
                      >
                        <img
                          src={col.image}
                          alt={col.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}

                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {col.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          style={{
                            borderTop: item.isSeparator ? "1px solid #F0F2F5" : "none",
                            paddingTop: item.isSeparator ? "8px" : 0,
                            marginTop: item.isSeparator ? "8px" : 0,
                          }}
                        >
                          <a
                            onClick={() => handleNavigate(item.slug, true)}
                            className="cursor-pointer"
                            style={{
                              fontSize: "15px",
                              fontWeight: item.isSeparator ? 500 : 400,
                              color: item.isSeparator ? "#010F1C" : "#55585B",
                              padding: "5px 0",
                              lineHeight: "2.1",
                              display: "block",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#0989FF";
                              e.currentTarget.style.paddingLeft = "5px";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = item.isSeparator ? "#010F1C" : "#55585B";
                              e.currentTarget.style.paddingLeft = "0px";
                            }}
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* 2. SUBMENU لقوائم Computers و Accessories و Gadgets تظهر فقط عند وقوف الماوس عليها */}
            {isHovered && category.type === "submenu" && category.submenu && (
              <div
                className="tp-submenu"
                onMouseEnter={() => setHoveredCategory(category.id)}
                style={{
                  position: "absolute",
                  left: "100%",
                  top: 0,
                  minWidth: "300px",
                  background: "#FFFFFF",
                  boxShadow: "0px 10px 30px rgba(1, 15, 28, 0.1)",
                  border: "1px solid #EAEBED",
                  borderRadius: "0 8px 8px 0",
                  padding: "12px 0",
                  zIndex: 100,
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {category.submenu.map((sub, sIdx) => (
                    <li key={sIdx} style={{ listStyle: "none" }}>
                      <a
                        onClick={() => handleNavigate(sub.slug, true)}
                        className="cursor-pointer"
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          color: "#55585B",
                          padding: "11px 30px",
                          display: "block",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#0989FF";
                          e.currentTarget.style.backgroundColor = "#F8FAFD";
                          e.currentTarget.style.paddingLeft = "35px";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#55585B";
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.paddingLeft = "30px";
                        }}
                      >
                        {sub.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}