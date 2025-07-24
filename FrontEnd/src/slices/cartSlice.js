import { createSlice } from "@reduxjs/toolkit";

// Load from localStorage
const shippingAddressFromStorage = localStorage.getItem("shippingAddress")
  ? JSON.parse(localStorage.getItem("shippingAddress"))
  : {};

const paymentMethodFromStorage = localStorage.getItem("paymentMethod")
  ? localStorage.getItem("paymentMethod")
  : "PayPal"; // default fallback

const initialState = {
  shippingAddress: shippingAddressFromStorage,
  paymentMethod: paymentMethodFromStorage,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("shippingAddress", JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("paymentMethod", action.payload);
    },
  },
});

export const { saveShippingAddress, savePaymentMethod } = cartSlice.actions;

export default cartSlice.reducer;
