import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    addCategory: builder.mutation({
      query: (data) => ({
        url: "/api/category/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    getShowCategory: builder.query({
      query: () => `/api/category/show`,
      providesTags: ["Category"],
    }),
    getProductTypeCategory: builder.query({
      query: (type) => `/api/category/show/${type}`,
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetProductTypeCategoryQuery,
  useGetShowCategoryQuery,
} = categoryApi;