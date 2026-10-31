import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn } from "./authSlice";
import Cookies from "js-cookie";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 1. تسجيل حساب جديد
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/api/user/signup",
        method: "POST",
        body: data,
      }),
    }),

    // 2. تسجيل الدخول بحساب Google (جلسة دائمة 365 يوماً)
    signUpProvider: builder.mutation({
      query: (token) => ({
        url: `/api/user/register/${token}`,
        method: "POST",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const token = result.data?.data?.token || result.data?.token;
          const user = result.data?.data?.user || result.data?.user;

          if (token && user) {
            Cookies.set(
              "userInfo",
              JSON.stringify({
                accessToken: token,
                user: user,
              }),
              { expires: 365, sameSite: "lax" } // دائم لمدة سنة كاملة
            );

            dispatch(
              userLoggedIn({
                accessToken: token,
                user: user,
              })
            );
          }
        } catch (err) {
          console.error("Provider auth error:", err);
        }
      },
    }),

    // 3. تسجيل الدخول العادي (جلسة دائمة 365 يوماً)
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/api/user/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const token = result.data?.data?.token || result.data?.token;
          const user = result.data?.data?.user || result.data?.user;

          if (token && user) {
            Cookies.set(
              "userInfo",
              JSON.stringify({
                accessToken: token,
                user: user,
              }),
              { expires: 365, sameSite: "lax" } // دائم لسنة كاملة ولا يخرج إلا بالـ Logout
            );

            dispatch(
              userLoggedIn({
                accessToken: token,
                user: user,
              })
            );
          }
        } catch (err) {
          console.error("Login error:", err);
        }
      },
    }),

    // 4. جلب بيانات العميل الحالي
    getUser: builder.query({
      query: () => "/api/user/me",
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result?.data) {
            dispatch(
              userLoggedIn({
                user: result.data,
              })
            );
          }
        } catch (err) {
          console.error("Get user error:", err);
        }
      },
    }),

    // 5. تأكيد البريد الإلكتروني
    confirmEmail: builder.query({
      query: (token) => `/api/user/confirmEmail/${token}`,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const tokenData = result.data?.data?.token || result.data?.token;
          const user = result.data?.data?.user || result.data?.user;

          if (tokenData && user) {
            Cookies.set(
              "userInfo",
              JSON.stringify({
                accessToken: tokenData,
                user: user,
              }),
              { expires: 365, sameSite: "lax" }
            );

            dispatch(
              userLoggedIn({
                accessToken: tokenData,
                user: user,
              })
            );
          }
        } catch (err) {
          console.error("Confirm email error:", err);
        }
      },
    }),

    // 6. طلب استعادة كلمة المرور
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/user/forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // 7. تأكيد تعيين كلمة المرور الجديدة
    confirmForgotPassword: builder.mutation({
      query: (data) => ({
        url: "/api/user/confirm-forget-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // 8. تغيير كلمة المرور
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/api/user/change-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // 9. تحديث الملف الشخصي
    updateProfile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/user/update-user/${id}`,
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const token = result.data?.data?.token || result.data?.token;
          const user = result.data?.data?.user || result.data?.user;

          if (token && user) {
            Cookies.set(
              "userInfo",
              JSON.stringify({
                accessToken: token,
                user: user,
              }),
              { expires: 365, sameSite: "lax" }
            );

            dispatch(
              userLoggedIn({
                accessToken: token,
                user: user,
              })
            );
          }
        } catch (err) {
          console.error("Update profile error:", err);
        }
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useConfirmEmailQuery,
  useResetPasswordMutation,
  useConfirmForgotPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useSignUpProviderMutation,
} = authApi;