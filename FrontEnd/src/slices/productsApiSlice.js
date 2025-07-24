import { PRODUCTS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        getProducts:builder.query({
            query:(keyword = '')=>({
                url:keyword ? `${PRODUCTS_URL}/search?keyword=${keyword}`: PRODUCTS_URL,
            }),
            keepUnusedDataFor:5
        }),
        getProductDetails:builder.query({
            query:(productId)=>({
                url:`${PRODUCTS_URL}/${productId}`,
            }),
            keepUnusedDataFor:5
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({
            url: `${PRODUCTS_URL}/${id}`,
            method: 'DELETE',
            }),
        }),
        createReview:builder.mutation({
            query:(data) =>({
                url:`${PRODUCTS_URL}/${data.productId}/review`,
                method:'POST',
                body:data,
            }),
            invalidatesTags:['Product'],
        }),
    })
});



export const {useGetProductsQuery,useGetProductDetailsQuery,useDeleteProductMutation,useCreateReviewMutation} = productsApiSlice;