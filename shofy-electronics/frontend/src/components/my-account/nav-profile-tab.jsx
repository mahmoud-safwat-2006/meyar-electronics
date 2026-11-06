import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

const NavProfileTab = ({ setActiveTab, orderData }) => {
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || "Mahmoud Safwat";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="shofy-overview-dashboard">
      {/* 1. كارت الترحيب الرئيسي */}
      <div className="shofy-card p-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <div className="shofy-avatar-circle" style={{ width: "56px", height: "56px", fontSize: "22px" }}>
              {userInitial}
            </div>
            <button className="shofy-avatar-camera" title="Change photo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#010f1c", fontSize: "20px" }}>
              Welcome back, {userName}!
            </h4>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              Manage your orders, addresses, and account details all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* 2. الكروت الثلاثة الملونة السريعة */}
      <div className="row g-3 mb-4">
        {/* كارت 1: View Orders */}
        <div className="col-md-4">
          <div className="shofy-action-card card-blue p-4 d-flex flex-column justify-content-between h-100">
            <div>
              <div className="shofy-card-icon icon-blue mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: "#010f1c", fontSize: "16px" }}>View Orders</h5>
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Track your recent orders and purchase history
              </p>
            </div>
            <button
              onClick={() => setActiveTab("orders")}
              className="shofy-card-link text-primary fw-semibold p-0 border-0 bg-transparent text-start d-flex align-items-center gap-1"
            >
              View Orders <span>→</span>
            </button>
          </div>
        </div>

        {/* كارت 2: Manage Addresses */}
        <div className="col-md-4">
          <div className="shofy-action-card card-green p-4 d-flex flex-column justify-content-between h-100">
            <div>
              <div className="shofy-card-icon icon-green mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: "#010f1c", fontSize: "16px" }}>Manage Addresses</h5>
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Update your shipping and billing addresses
              </p>
            </div>
            <button
              onClick={() => setActiveTab("addresses")}
              className="shofy-card-link text-success fw-semibold p-0 border-0 bg-transparent text-start d-flex align-items-center gap-1"
            >
              Manage Addresses <span>→</span>
            </button>
          </div>
        </div>

        {/* كارت 3: Account Settings */}
        <div className="col-md-4">
          <div className="shofy-action-card card-amber p-4 d-flex flex-column justify-content-between h-100">
            <div>
              <div className="shofy-card-icon icon-amber mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: "#010f1c", fontSize: "16px" }}>Account Settings</h5>
              <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Edit your profile and account preferences
              </p>
            </div>
            <button
              onClick={() => setActiveTab("settings")}
              className="shofy-card-link text-warning fw-semibold p-0 border-0 bg-transparent text-start d-flex align-items-center gap-1"
              style={{ color: "#d97706" }}
            >
              Edit Account <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. بانر التسوق السفلي السماوي (Ready to start shopping?) */}
      <div className="shofy-shopping-banner p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h5 className="fw-bold mb-1" style={{ color: "#010f1c", fontSize: "17px" }}>Ready to start shopping?</h5>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Discover thousands of products from top brands.
          </p>
        </div>
        <Link href="/shop" className="shofy-primary-btn">
          Browse Products
        </Link>
      </div>
    </div>
  );
};

export default NavProfileTab;