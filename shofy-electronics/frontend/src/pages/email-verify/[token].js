import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Link from "next/link";
// internal
import ErrorMsg from "@/components/common/error-msg";
import { useConfirmEmailQuery } from "@/redux/features/auth/authApi";
import { notifySuccess, notifyError } from "@/utils/toast";
import Wrapper from "@/layout/wrapper";

const EmailVerification = ({ params }) => {
  const router = useRouter();
  const token = params?.token || router.query?.token;

  // تخطي الطلب في حال لم يتوفر التوكن بعد (Skip until token is ready)
  const { data, isLoading, isError, error, isSuccess } = useConfirmEmailQuery(token, {
    skip: !token,
  });

  useEffect(() => {
    if (isSuccess) {
      notifySuccess("Account activated successfully! Please log in.");
      // توجيه تلقائي لصفحة تسجيل الدخول بعد ثانيتين
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [router, isSuccess]);

  const errorMessage =
    error?.data?.error ||
    error?.data?.message ||
    "Invalid or expired verification link.";

  return (
    <Wrapper>
      <div
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{ backgroundColor: "#f8f9fa", padding: "20px" }}
      >
        <div
          className="card border-0 shadow-sm p-4 p-md-5 text-center"
          style={{ maxWidth: "500px", width: "100%", borderRadius: "16px" }}
        >
          {isLoading ? (
            <div>
              <div
                className="spinner-border text-primary mb-3"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              ></div>
              <h3 className="fw-bold mb-2">Verifying Account</h3>
              <p className="text-muted">Please wait while we verify your email address...</p>
            </div>
          ) : isSuccess ? (
            <div>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3"
                style={{ width: "80px", height: "80px", fontSize: "36px" }}
              >
                ✓
              </div>
              <h3 className="fw-bold text-dark mb-2">Account Activated!</h3>
              <p className="text-muted mb-4">
                {data?.message || "Your account has been successfully verified. You can now access your account."}
              </p>
              <Link
                href="/login"
                className="btn btn-primary w-100 py-3 fw-bold"
                style={{ backgroundColor: "#0989ff", borderColor: "#0989ff", borderRadius: "8px" }}
              >
                Proceed to Login
              </Link>
            </div>
          ) : (
            <div>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-3"
                style={{ width: "80px", height: "80px", fontSize: "36px" }}
              >
                ✕
              </div>
              <h3 className="fw-bold text-dark mb-2">Verification Failed</h3>
              <div className="mb-4">
                <ErrorMsg msg={errorMessage} />
              </div>
              <div className="d-flex gap-2 justify-content-center">
                <Link
                  href="/register"
                  className="btn btn-outline-secondary px-4 py-2"
                  style={{ borderRadius: "8px" }}
                >
                  Create New Account
                </Link>
                <Link
                  href="/login"
                  className="btn btn-primary px-4 py-2"
                  style={{ backgroundColor: "#0989ff", borderColor: "#0989ff", borderRadius: "8px" }}
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params: params || {} },
  };
};

export default EmailVerification;