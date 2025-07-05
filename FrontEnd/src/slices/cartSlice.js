import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../Utils/cartUtils";

const initialState = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : {cartItems:[],shippingAddress: {}, paymentMethod:'PayPal'};



const cartSlice=createSlice({
    name:"cart",
    initialState,
    reducers:{
        addToCart:(state,action)=>{
            const item=action.payload;

            const existItem=state.cartItems.find((x)=>x.id===item.id);

            if(existItem){
                state.cartItems=state.cartItems.map((x)=>x.id===existItem.id ? item:x )
            }else{
                state.cartItems=[...state.cartItems,item];
            }
            return updateCart(state);
            
        },
        removeFromCart:(state,action) =>{
            state.cartItems=state.cartItems.filter((x)=>x.id!==action.payload);
            return updateCart(state);
        },
        saveShippingAddress:(state,action) =>{
            state.shippingAddress=action.payload;
            return updateCart(state);
        },
        savePaymentMethod:(state,action) =>{
            state.paymentMethod=action.payload;
            return updateCart(state);
        },
        
    }
})

export const {addToCart,removeFromCart,saveShippingAddress,savePaymentMethod}=cartSlice.actions;
export default cartSlice.reducer;