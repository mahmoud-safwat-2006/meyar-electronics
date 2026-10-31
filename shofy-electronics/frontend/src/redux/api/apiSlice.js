import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// قراءة رابط السيرفر من متغيرات البيئة مع إزالة أي شرطة مائلة زائدة في النهاية
const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7000";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      try {
        // 1. محاولة قراءة التوكن مباشرة من الـ Redux State في الذاكرة
        let token = getState()?.auth?.accessToken;

        // 2. إذا لم يكن متوفراً في الحالة (مثلاً بعد Reload)، نقرأه من الكوكيز
        if (!token) {
          const userInfo = Cookies.get("userInfo");
          if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            token = parsedUser?.accessToken || parsedUser?.token;
          }
        }

        // 3. ضبط ترويسة التفويض
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (error) {
        console.error("Error reading authentication token:", error);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({}),
  tagTypes: [
    "Products",
    "Product",
    "ProductType",
    "OfferProducts",
    "PopularProducts",
    "TopRatedProducts",
    "RelatedProducts",
    "Coupon",
    "UserOrder",
    "UserOrders",
    "Category",
    "Brand",
    "Review",
  ],
});