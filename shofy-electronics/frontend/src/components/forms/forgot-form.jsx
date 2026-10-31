import React from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// internal
import ErrorMsg from "../common/error-msg";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

// English Validation Schema
const schema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

const ForgotForm = () => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await resetPassword({
        verifyEmail: data.email.trim().toLowerCase(),
      });

      if (result?.error) {
        const errorMsg =
          result.error?.data?.message ||
          result.error?.data?.error ||
          "No account found with this email address";
        notifyError(errorMsg);
      } else {
        notifySuccess(
          result.data?.message ||
            "Password reset link has been sent to your email successfully!"
        );
        reset();
      }
    } catch (err) {
      console.error(err);
      notifyError("An error occurred while connecting to the server");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("email")}
              id="email"
              type="email"
              placeholder="meyar@example.com"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">Your Email</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
      </div>
      <div className="tp-login-bottom mb-15">
        <button
          type="submit"
          className="tp-login-btn w-100"
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
        >
          {isLoading ? "Sending Link..." : "Send Reset Link"}
        </button>
      </div>
    </form>
  );
};

export default ForgotForm;