import { apiSlice } from "../../api/apiSlice";
import { set_client_secret } from "./orderSlice";

export const orderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // createPaymentIntent
    createPaymentIntent: builder.mutation({
      query: (data) => ({
        url: "/api/order/create-payment-intent",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.clientSecret) {
            dispatch(set_client_secret(data.clientSecret));
          }
        } catch (err) {
          // do nothing
        }
      },
    }),

    // saveOrder
    saveOrder: builder.mutation({
      query: (data) => ({
        url: "/api/order/saveOrder",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserOrders"],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data && typeof window !== "undefined") {
            localStorage.removeItem("couponInfo");
            localStorage.removeItem("cart_products");
            localStorage.removeItem("shipping_info");
          }
        } catch (err) {
          // do nothing
        }
      },
    }),

    // getUserOrders
    getUserOrders: builder.query({
      query: () => `/api/user-order`,
      providesTags: ["UserOrders"],
      keepUnusedDataFor: 600,
    }),

    // getUserOrderById
    getUserOrderById: builder.query({
      query: (id) => `/api/user-order/${id}`,
      providesTags: (result, error, arg) => [{ type: "UserOrder", id: arg }],
      keepUnusedDataFor: 600,
    }),
  }),
});

// Alias لضمان التوافق مع أي استيرادات سابقة بالاسم القديم
export const authApi = orderApi;

export const {
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
  useGetUserOrderByIdQuery,
  useGetUserOrdersQuery,
} = orderApi;