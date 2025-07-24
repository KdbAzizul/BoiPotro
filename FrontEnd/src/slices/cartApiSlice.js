import { apiSlice } from './apiSlice';
import { CART_URL } from '../constants';

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: CART_URL,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation({
      query: ({ book_id, quantity }) => ({
        url: CART_URL,
        method: 'POST',
        body: { book_id, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation({
      query: (book_id) => ({
        url: `${CART_URL}/${book_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: `${CART_URL}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApiSlice;
