import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// قراءة بيانات العميل المحفوظة فور فتح المتصفح لمنع الوميض وضمان بقاء الدخول
const getInitialAuth = () => {
  try {
    const storedUserInfo = Cookies.get("userInfo");
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      return {
        accessToken: parsed.accessToken,
        user: parsed.user,
      };
    }
  } catch (error) {
    console.error("Error loading auth session:", error);
  }
  return {
    accessToken: undefined,
    user: undefined,
  };
};

const initialState = getInitialAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // تسجيل الدخول وحفظ الجلسة لسنة كاملة
    userLoggedIn: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;

      Cookies.set(
        "userInfo",
        JSON.stringify({
          accessToken: payload.accessToken,
          user: payload.user,
        }),
        { expires: 365, sameSite: "lax" } // يظل مسجلاً لمدة 365 يوماً كاملة
      );
    },

    // تسجيل الخروج (يحدث فقط عند الضغط على Logout)
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      Cookies.remove("userInfo");
      if (typeof window !== "undefined") {
        localStorage.removeItem("userInfo");
        sessionStorage.removeItem("userInfo");
      }
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;