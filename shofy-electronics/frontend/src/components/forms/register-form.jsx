import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/router";

// internal
import { CloseEye, OpenEye } from "@/svg";
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useRegisterUserMutation } from "@/redux/features/auth/authApi";

// English Validation schema
const schema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Full name is required")
    .min(3, "Name must be at least 3 characters"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  remember: Yup.bool()
    .oneOf([true], "You must agree to the Terms of Service and Privacy Policy to continue"),
});

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const router = useRouter();
  const { redirect } = router.query;

  // React Hook Form with Yup Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Submit registration request
  const onSubmit = async (data) => {
    try {
      const result = await registerUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (result?.error) {
        const errorMsg =
          result.error?.data?.message ||
          result.error?.data?.error ||
          "Failed to create account, please try again";
        notifyError(errorMsg);
      } else {
        const successMsg =
          result.data?.message ||
          "Account created successfully! Please check your email to verify.";
        notifySuccess(successMsg);
        reset();
        router.push(redirect || "/login");
      }
    } catch (err) {
      console.error(err);
      notifyError("An error occurred while connecting to the server");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        {/* Full Name */}
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("name")}
              id="name"
              type="text"
              placeholder="Your Full Name"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="name">Your Name</label>
          </div>
          <ErrorMsg msg={errors.name?.message} />
        </div>

        {/* Email */}
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

        {/* Password */}
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

      {/* Terms of Service Checkbox */}
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input
            {...register("remember")}
            id="remember"
            type="checkbox"
            defaultChecked
          />
          <label htmlFor="remember">
            I agree to the <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>.
          </label>
          <ErrorMsg msg={errors.remember?.message} />
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
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;