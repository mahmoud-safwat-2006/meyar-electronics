import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/redux/features/auth/authApi";

const ProfileInfo = () => {
  const { user } = useSelector((state) => state.auth);
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();

  // إظهار وإخفاء كلمات المرور
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // فورم بيانات الحساب
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
  } = useForm({
    defaultValues: {
      name: user?.name || "Mahmoud Safwat",
      email: user?.email || "mahmoudsafwat118@gmail.com",
      phone: user?.phone || "+20 100 000 0000",
      dob: "1998-05-15",
    },
  });

  // فورم كلمة المرور
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
  } = useForm();

  // تحديث البروفايل
  const onProfileSubmit = (data) => {
    updateProfile({
      id: user?._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
    }).then((res) => {
      if (res?.error) {
        notifyError(res?.error?.data?.message || "Failed to update profile");
      } else {
        notifySuccess("Profile updated successfully!");
      }
    });
  };

  // تغيير كلمة المرور
  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      notifyError("Passwords do not match!");
      return;
    }
    changePassword({
      email: user?.email,
      password: data.currentPassword,
      newPassword: data.newPassword,
    }).then((res) => {
      if (res?.error) {
        notifyError(res?.error?.data?.message || "Failed to change password");
      } else {
        notifySuccess("Password changed successfully!");
        resetPasswordForm();
      }
    });
  };

  // حذف الحساب
  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      notifyError("Account deletion request initiated.");
    }
  };

  // أيقونة إظهار/إخفاء الباسورد
  const EyeIcon = ({ visible }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      )}
    </svg>
  );

  return (
    <div className="shofy-settings-wrapper d-flex flex-column gap-4">
      {/* 1. قسم معلومات البروفايل */}
      <div className="shofy-card p-4">
        <div className="mb-4">
          <h5 className="fw-bold mb-1" style={{ color: "#010f1c", fontSize: "18px" }}>Profile Information</h5>
          <p className="text-muted" style={{ fontSize: "14px" }}>
            Update your account's profile information and email address.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Full Name</label>
              <input
                {...registerProfile("name")}
                type="text"
                className="form-control shofy-input"
                placeholder="Mahmoud Safwat"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Date of birth</label>
              <input
                {...registerProfile("dob")}
                type="date"
                className="form-control shofy-input"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Email</label>
              <input
                {...registerProfile("email")}
                type="email"
                className="form-control shofy-input"
                placeholder="mahmoudsafwat118@gmail.com"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Phone</label>
              <input
                {...registerProfile("phone")}
                type="tel"
                className="form-control shofy-input"
                placeholder="+20 100 000 0000"
              />
            </div>

            <div className="col-12 pt-2">
              <button type="submit" className="shofy-primary-btn">
                Update
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. قسم تغيير كلمة المرور */}
      <div className="shofy-card p-4">
        <div className="mb-4">
          <h5 className="fw-bold mb-1" style={{ color: "#010f1c", fontSize: "18px" }}>Change password</h5>
          <p className="text-muted" style={{ fontSize: "14px" }}>
            Ensure your account is using a long, random password to stay secure.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Current password</label>
              <div className="position-relative">
                <input
                  {...registerPassword("currentPassword", { required: true })}
                  type={showCurrentPass ? "text" : "password"}
                  className="form-control shofy-input pe-5"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="position-absolute end-0 top-50 translate-middle-y me-3 border-0 bg-transparent text-muted cursor-pointer"
                >
                  <EyeIcon visible={showCurrentPass} />
                </button>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Password</label>
              <div className="position-relative">
                <input
                  {...registerPassword("newPassword", { required: true })}
                  type={showNewPass ? "text" : "password"}
                  className="form-control shofy-input pe-5"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="position-absolute end-0 top-50 translate-middle-y me-3 border-0 bg-transparent text-muted cursor-pointer"
                >
                  <EyeIcon visible={showNewPass} />
                </button>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>Password confirmation</label>
              <div className="position-relative">
                <input
                  {...registerPassword("confirmPassword", { required: true })}
                  type={showConfirmPass ? "text" : "password"}
                  className="form-control shofy-input pe-5"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="position-absolute end-0 top-50 translate-middle-y me-3 border-0 bg-transparent text-muted cursor-pointer"
                >
                  <EyeIcon visible={showConfirmPass} />
                </button>
              </div>
            </div>

            <div className="col-12 pt-2">
              <button type="submit" className="shofy-primary-btn">
                Change password
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. قسم حذف الحساب مع رسالة التحذير */}
      <div className="shofy-card p-4 border-danger-subtle">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="text-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </span>
          <h5 className="fw-bold mb-0 text-danger" style={{ fontSize: "18px" }}>Delete Account</h5>
        </div>
        <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
          Permanently delete your account and all associated data.
        </p>

        <div className="shofy-warning-box p-3 mb-4 rounded d-flex align-items-start gap-2">
          <span className="text-warning mt-1">⚠️</span>
          <span style={{ fontSize: "13px", color: "#856404" }}>
            <strong>Warning:</strong> Once your account is deleted, all of its resources and data will be permanently deleted. Please download any data or information regarding this account that you wish to retain before proceeding.
          </span>
        </div>

        <div>
          <button
            onClick={handleDeleteAccount}
            className="btn btn-outline-danger px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
            style={{ borderRadius: "6px", fontSize: "14px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete your account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;