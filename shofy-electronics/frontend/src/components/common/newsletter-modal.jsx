import React, { useState, useEffect } from "react";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان الزائر قد اختار عدم إظهار النافذة مجدداً
    const isDismissed =
      typeof window !== "undefined"
        ? localStorage.getItem("shofy_newsletter_dismissed")
        : null;

    if (!isDismissed) {
      // إظهار النافذة تلقائياً بعد 2.5 ثانية مثل shofy.botble.com تماماً
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem("shofy_newsletter_dismissed", "true");
    }
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem("shofy_newsletter_dismissed", "true");
    }
    setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(1, 15, 28, 0.6)",
        backdropFilter: "blur(2px)",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "760px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* زر الإغلاق البسيط النظيف المطابق للموقع الأصلي */}
        <button
          onClick={handleClose}
          type="button"
          style={{
            position: "absolute",
            top: "16px",
            right: "18px",
            zIndex: 10,
            background: "transparent",
            border: "none",
            color: "#55585b",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s ease",
          }}
          aria-label="Close"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#010f1c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#55585b";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* الصورة الأصلية على اليسار بكامل نقائها وبدون أي تشويه */}
        <div
          style={{
            width: "50%",
            position: "relative",
            minHeight: "420px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <img
            src="https://shofy.botble.com/storage/main/general/newsletter-popup.jpg"
            alt="Newsletter Special Offer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* الجانب الأيمن: نموذج الاشتراك المطابق لموقع Shofy */}
        <div
          style={{
            width: "50%",
            padding: "42px 40px 35px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "left",
            backgroundColor: "#ffffff",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#55585b",
              fontWeight: "400",
              marginBottom: "6px",
              display: "block",
            }}
          >
            Newsletter
          </span>

          <h3
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#010f1c",
              margin: "0 0 10px 0",
              lineHeight: "1.2",
            }}
          >
            Subscribe Now
          </h3>

          <p
            style={{
              color: "#55585b",
              fontSize: "14px",
              lineHeight: "1.5",
              margin: "0 0 22px 0",
            }}
          >
            Subscribe to our newsletter and get 10% off your first purchase
          </p>

          {submitted ? (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                color: "#166534",
                fontSize: "14px",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              🎉 Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#010f1c",
                    marginBottom: "6px",
                  }}
                >
                  Email Address <span style={{ color: "#ff182a" }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 15px",
                    borderRadius: "6px",
                    border: "1px solid #e0e2e5",
                    fontSize: "14px",
                    color: "#010f1c",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#0989ff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e2e5";
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  height: "46px",
                  backgroundColor: "#0989ff",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "15px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "16px",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0070df";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0989ff";
                }}
              >
                Subscribe
              </button>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  style={{
                    cursor: "pointer",
                    width: "15px",
                    height: "15px",
                    accentColor: "#0989ff",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#55585b" }}>
                  Don't show this popup again
                </span>
              </label>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}