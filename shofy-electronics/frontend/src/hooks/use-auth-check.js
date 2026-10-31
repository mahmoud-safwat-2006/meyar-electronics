import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { userLoggedIn } from "@/redux/features/auth/authSlice";

export default function useAuthCheck() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    try {
      // 1. قراءة بيانات الجلسة من الكوكيز أو التخزين المحلي
      let localAuth = Cookies.get("userInfo");

      if (!localAuth && typeof window !== "undefined") {
        localAuth = localStorage.getItem("userInfo");
      }

      if (localAuth) {
        const auth = JSON.parse(localAuth);
        const token = auth?.accessToken || auth?.token;
        const user = auth?.user;

        // 2. تفعيل تسجيل الدخول واسترجاع بيانات العميل
        if (token && user) {
          dispatch(
            userLoggedIn({
              accessToken: token,
              user: user,
            })
          );
        }
      }
    } catch (error) {
      console.error("Error restoring user session:", error);
      // مسح البيانات التالفة بأمان لمنع انهيار الصفحة
      Cookies.remove("userInfo");
      if (typeof window !== "undefined") {
        localStorage.removeItem("userInfo");
      }
    } finally {
      setAuthChecked(true);
    }
  }, [dispatch]);

  return authChecked;
}