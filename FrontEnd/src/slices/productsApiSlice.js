import { PRODUCTS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword = "", pageNumber = 1, pageSize = 16 }) => ({
        url: keyword
          ? `${PRODUCTS_URL}/search?keyword=${keyword}&page=${pageNumber}&pageSize=${pageSize}`
          : `${PRODUCTS_URL}?page=${pageNumber}&pageSize=${pageSize}`,
      }),
      transformResponse: (response) => {
        // The response contains { products, page, pages, total }
        // We need to return just the products array for the component
          return {
          products: response.products || [],
          page: response.page || 1,
          pages: response.pages || 1,
          total: response.total || 0
        };
      },
      keepUnusedDataFor: 5,
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: "DELETE",
      }),
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}/review`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useUpdateProductMutation,
  useCreateProductMutation,
} = productsApiSlice;
