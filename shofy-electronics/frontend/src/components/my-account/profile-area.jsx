import React, { useState } from "react";
import Link from "next/link";
import ProfileNavTab from "./profile-nav-tab";
import NavProfileTab from "./nav-profile-tab";
import ProfileInfo from "./profile-info";
import MyOrders from "./my-orders";

const ProfileArea = ({ orderData }) => {
  // حالة التبويب النشط: overview, orders, invoices, reviews, downloads, returns, addresses, settings, vendor
  const [activeTab, setActiveTab] = useState("overview");

  // مكون مشترك للشاشات الفارغة مطابق تماماً لصور الموقع
  const EmptyStateCard = ({ title, subtitle, btnText, btnLink = "/shop" }) => (
    <div className="shofy-profile-card text-center py-5 px-3">
      <div className="empty-state-illustration mb-3">
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="42" cy="42" r="42" fill="#F4F6F8" />
          <path d="M26 34H58L54 54H30L26 34Z" stroke="#8A92A6" strokeWidth="2" strokeLinejoin="round" />
          <path d="M36 40V46M48 40V46" stroke="#8A92A6" strokeWidth="2" strokeLinecap="round" />
          <path d="M33 34L37 26H47L51 34" stroke="#8A92A6" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
      <h4 className="fw-bold mb-2" style={{ color: "#010f1c", fontSize: "20px" }}>{title}</h4>
      <p className="text-muted mb-4" style={{ fontSize: "14px" }}>{subtitle}</p>
      {btnText && (
        <Link href={btnLink} className="shofy-primary-btn d-inline-flex align-items-center gap-2">
          <span>+</span> {btnText}
        </Link>
      )}
    </div>
  );

  return (
    <section className="profile__area pt-60 pb-100 bg-white">
      <div className="container">
        <div className="row g-4">
          {/* العمود الجانبي الأيسر: القائمة وبيانات المستخدم */}
          <div className="col-xl-3 col-lg-4">
            <ProfileNavTab activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* العمود الرئيسي الأيمن: محتوى كل تبويب */}
          <div className="col-xl-9 col-lg-8">
            <div className="profile__wrapper ps-xl-3">
              {/* 1. التبويب الأول: Overview */}
              {activeTab === "overview" && (
                <div>
                  <h3 className="profile-section-title mb-4">Overview</h3>
                  <NavProfileTab setActiveTab={setActiveTab} orderData={orderData} />
                </div>
              )}

              {/* 2. التبويب الثاني: Orders */}
              {activeTab === "orders" && (
                <div>
                  <h3 className="profile-section-title mb-4">Orders</h3>
                  <MyOrders orderData={orderData} />
                </div>
              )}

              {/* 3. التبويب الثالث: Invoices */}
              {activeTab === "invoices" && (
                <div>
                  <h3 className="profile-section-title mb-4">Invoices</h3>
                  <EmptyStateCard
                    title="No invoices yet!"
                    subtitle="You have not received any invoices yet."
                    btnText="Start shopping now"
                    btnLink="/shop"
                  />
                </div>
              )}

              {/* 4. التبويب الرابع: Reviews */}
              {activeTab === "reviews" && (
                <div>
                  <h3 className="profile-section-title mb-4">Product Reviews</h3>
                  <EmptyStateCard
                    title="No reviews yet!"
                    subtitle="Start shopping and share your experience by reviewing products you've purchased."
                    btnText="Start Shopping"
                    btnLink="/shop"
                  />
                </div>
              )}

              {/* 5. التبويب الخامس: Downloads */}
              {activeTab === "downloads" && (
                <div>
                  <h3 className="profile-section-title mb-4">Downloads</h3>
                  <EmptyStateCard
                    title="No digital products!"
                    subtitle="You have not purchased any digital products yet."
                  />
                </div>
              )}

              {/* 6. التبويب السادس: Order Return Requests */}
              {activeTab === "returns" && (
                <div>
                  <h3 className="profile-section-title mb-4">Order Return Requests</h3>
                  <EmptyStateCard
                    title="No return requests yet!"
                    subtitle="You haven't requested any product returns."
                  />
                </div>
              )}

              {/* 7. التبويب السابع: Addresses */}
              {activeTab === "addresses" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="profile-section-title mb-0">Addresses</h3>
                    <button className="shofy-primary-btn btn-sm">
                      + Add New Address
                    </button>
                  </div>
                  <EmptyStateCard
                    title="No addresses yet!"
                    subtitle="Add a shipping or billing address to make checkout faster."
                    btnText="Add Your First Address"
                    btnLink="#"
                  />
                </div>
              )}

              {/* 8. التبويب الثامن: Account Settings */}
              {activeTab === "settings" && (
                <div>
                  <h3 className="profile-section-title mb-4">Account Settings</h3>
                  <ProfileInfo />
                </div>
              )}

              {/* 9. التبويب التاسع: Become Vendor */}
              {activeTab === "vendor" && (
                <div>
                  <h3 className="profile-section-title mb-4">Become a Vendor</h3>
                  <div className="shofy-card p-4">
                    <div className="mb-4">
                      <h5 className="fw-bold mb-1" style={{ color: "#010f1c" }}>Register Your Store</h5>
                      <p className="text-muted" style={{ fontSize: "14px" }}>
                        Start selling your products on our marketplace to reach thousands of customers.
                      </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); alert("Vendor application submitted successfully!"); }}>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Shop Name *</label>
                          <input type="text" className="form-control shofy-input" placeholder="e.g. Modern Electronics" required />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Shop URL *</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light text-muted" style={{ fontSize: "13px" }}>https://domain.com/shop/</span>
                            <input type="text" className="form-control shofy-input" placeholder="your-shop-slug" required />
                          </div>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Shop Phone Number *</label>
                          <input type="tel" className="form-control shofy-input" placeholder="+20 100 000 0000" required />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Shop Description</label>
                          <textarea rows="3" className="form-control shofy-input" placeholder="Briefly describe what your shop sells..."></textarea>
                        </div>
                        <div className="col-12">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="termsCheck" required />
                            <label className="form-check-label text-muted" htmlFor="termsCheck" style={{ fontSize: "13px" }}>
                              I agree with the <Link href="/terms" className="text-primary text-decoration-none">Vendor Terms & Conditions</Link>
                            </label>
                          </div>
                        </div>
                        <div className="col-12 pt-2">
                          <button type="submit" className="shofy-primary-btn">
                            Register as Vendor
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileArea;