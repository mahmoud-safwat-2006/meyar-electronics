import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";

// internal
import { useSignUpProviderMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const GoogleSignUp = () => {
  const [signUpProvider] = useSignUpProviderMutation();
  const router = useRouter();
  const { redirect } = router.query;

  // Handle Google Token Response
  const handleGoogleSignIn = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) {
        notifyError("Failed to retrieve Google credentials.");
        return;
      }

      const res = await signUpProvider(token);

      if (res?.data) {
        notifySuccess("Logged in successfully with Google! Welcome to Meyar");
        router.push(redirect || "/");
      } else {
        const errorMsg =
          res?.error?.data?.message ||
          res?.error?.data?.error ||
          res?.error?.message ||
          "Google sign in failed. Please try again.";
        notifyError(errorMsg);
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      notifyError("An error occurred while connecting to the server");
    }
  };

  return (
    <div className="google-sign-in-container d-flex justify-content-center">
      <GoogleLogin
        onSuccess={handleGoogleSignIn}
        onError={() => notifyError("Google authentication failed")}
        locale="en"
        text="signin_with"
        theme="outline"
        size="large"
        shape="rectangular"
        width="280"
      />
    </div>
  );
};

export default GoogleSignUp;