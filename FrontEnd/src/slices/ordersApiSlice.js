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
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    updateOrderState: builder.mutation({
      query: ({orderId,state}) => ({
        url: `${ORDERS_URL}/${orderId}/state`,
        method: "PUT",
        body:{state},
      }),
    }),
    getMyOrders:builder.query({
      query:()=>({
        url:`${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor:5
    }),
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/cancel`,
        method: "PUT",
      }),
    }),


  }),
});

export const {
  useCreateOrderMutation,
  useValidateCouponMutation,
  useGetOrderDetailsQuery,
  useGetOrdersQuery,
  useUpdateOrderStateMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} = ordersApiSlice;
