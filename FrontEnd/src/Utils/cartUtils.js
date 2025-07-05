export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

export const updateCart = (state) => {


  let total_price = state.cartItems.reduce((acc, item) => {
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const finalPrice = price - (price * discount) / 100;
    return acc + item.qty * finalPrice;
  }, 0);

  state.itemsPrice=addDecimals(total_price);

  //calculate shipping price
  state.shippingPrice = addDecimals(state.itemsPrice > 200 ? 0 : 5);

  //calculate tax price
  state.taxPrice = addDecimals(Number((0.05 * state.itemsPrice).toFixed(2)));

  //calculate total price
  state.totalPrice = (
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice)
  ).toFixed(2);

  localStorage.setItem("cart", JSON.stringify(state));

  return state;
};
