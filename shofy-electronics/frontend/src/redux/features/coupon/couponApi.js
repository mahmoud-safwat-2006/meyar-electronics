import { apiSlice } from "@/redux/api/apiSlice";

export const couponApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // get offer coupon
    getOfferCoupons: builder.query({
      query: () => `/api/coupon`,
      providesTags: ["Coupon"],
      keepUnusedDataFor: 600,
    }),
  }),
});

// تصدير بديل لضمان التوافق مع أي استيراد سابق بالاسم القديم
export const authApi = couponApi;

export const { useGetOfferCouponsQuery } = couponApi;