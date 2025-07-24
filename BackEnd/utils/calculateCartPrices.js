export const calculateCartPrices = (cartItems) => {
  let itemsPrice = 0;

  const updatedItems = cartItems.map((item) => {
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const finalPrice = price - (price * discount) / 100;

    const itemTotal = finalPrice * item.quantity;
    itemsPrice += itemTotal;

    return {
      ...item,
      finalPrice: parseFloat(finalPrice.toFixed(2)), // include per item
    };
  });

  itemsPrice = parseFloat(itemsPrice.toFixed(2));
  const shippingPrice = itemsPrice > 200 ? 0 : 5;
  //const taxPrice = parseFloat((0.05 * itemsPrice).toFixed(2));
  const totalPrice = parseFloat(
    (itemsPrice + shippingPrice ).toFixed(2)
  );

  return {
    cartItems: updatedItems,
    itemsPrice,
    shippingPrice,
   
    totalPrice,
  };
};
