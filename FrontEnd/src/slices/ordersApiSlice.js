import { apiSlice } from "./apiSlice";
import { ORDERS_URL } from "../constants";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: { ...order },
      }),
    }),
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/validateCoupon`,
        method: "POST",
        body: data,
      }),
    }),
    
  }),
});

export const { useCreateOrderMutation,useValidateCouponMutation } = ordersApiSlice;
