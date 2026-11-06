import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

// علم أمريكا
const language = [
  {
    id: 1,
    title: "English",
    code: "en",
    flag: (
      <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
        <rect width="18" height="13" rx="1" fill="#D80027" />
        <rect y="1.85718" width="18" height="1.85714" fill="white" />
        <rect y="5.57141" width="18" height="1.85714" fill="white" />
        <rect y="9.28564" width="18" height="1.85714" fill="white" />
        <rect width="8" height="7.42857" fill="#0052B4" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Arabic",
    code: "ar",
    flag: null,
  },
];

// العملات
const currency = [
  { id: 1, title: "USD ($)", code: "USD" },
  { id: 2, title: "EUR (€)", code: "EUR" },
  { id: 3, title: "EGP (ج.م)", code: "EGP" },
];

const HeaderTopRight = () => {
  const [activeLang, setActiveLang] = useState(language[0]);
  const [activeCurr, setActiveCurr] = useState(currency[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrOpen, setIsCurrOpen] = useState(false);

  return (
    <div className="tp-header-top-menu d-flex align-items-center justify-content-end">
      {/* Language */}
      <div className="tp-header-top-menu-item tp-header-lang p-relative mr-20">
        <span
          onClick={() => {
            setIsLangOpen(!isLangOpen);
            setIsCurrOpen(false);
          }}
          className="tp-header-lang-toggle"
          style={{
            cursor: "pointer",
            fontSize: "13px",
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {activeLang.flag}
          {activeLang.title}
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
            <path
              d="M1 1L4 4L7 1"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <ul
          className={isLangOpen ? "tp-header-lang-list open" : "tp-header-lang-list"}
          style={{
            display: isLangOpen ? "block" : "none",
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: "#010f1c",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 0",
            listStyle: "none",
            zIndex: 99999,
            minWidth: "110px",
            borderRadius: "4px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}
        >
          {language.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                setActiveLang(item);
                setIsLangOpen(false);
              }}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                color: "#a0a2a5",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#0989FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#a0a2a5";
              }}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Currency */}
      <div className="tp-header-top-menu-item tp-header-currency p-relative">
        <span
          onClick={() => {
            setIsCurrOpen(!isCurrOpen);
            setIsLangOpen(false);
          }}
          className="tp-header-currency-toggle"
          style={{
            cursor: "pointer",
            fontSize: "13px",
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {activeCurr.title}
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
            <path
              d="M1 1L4 4L7 1"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <ul
          className={isCurrOpen ? "tp-header-currency-list open" : "tp-header-currency-list"}
          style={{
            display: isCurrOpen ? "block" : "none",
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: "#010f1c",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 0",
            listStyle: "none",
            zIndex: 99999,
            minWidth: "110px",
            borderRadius: "4px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}
        >
          {currency.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                setActiveCurr(item);
                setIsCurrOpen(false);
              }}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                color: "#a0a2a5",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#0989FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#a0a2a5";
              }}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HeaderTopRight;