import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/router";
import Link from "next/link";

// internal
import { CloseEye, OpenEye } from "@/svg";
import ErrorMsg from "../common/error-msg";
import { useLoginUserMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

// English Validation Schema
const schema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const router = useRouter();
  const { redirect } = router.query;

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle Login Submit
  const onSubmit = async (data) => {
    try {
      const res = await loginUser({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (res?.data) {
        notifySuccess("Logged in successfully! Welcome to Meyar Electronics");
        reset();
        router.push(redirect || "/");
      } else {
        const errorMsg =
          res?.error?.data?.message ||
          res?.error?.data?.error ||
          "Invalid email or password";
        notifyError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      notifyError("An error occurred while connecting to the server");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        {/* Email Field */}
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

        {/* Password Field */}
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("password")}
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="tp-login-input-eye" id="password-show-toggle">
              <span
                className="open-eye"
                onClick={() => setShowPass(!showPass)}
                style={{ cursor: "pointer" }}
              >
                {showPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="password">Password</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message} />
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input id="remeber" type="checkbox" defaultChecked />
          <label htmlFor="remeber">Remember me</label>
        </div>
        <div className="tp-login-forgot">
          <Link href="/forgot">Forgot password?</Link>
        </div>
      </div>

      {/* Submit Button */}
      <div className="tp-login-bottom">
        <button
          type="submit"
          className="tp-login-btn w-100"
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;