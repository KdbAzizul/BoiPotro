import pool from "../db.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { calculateCartPrices } from "../utils/calculateCartPrices.js";

// @desc add a book to cart
// @route POST /api/cart
// @access Private
const addToCart = asyncHandler(async (req, res) => {
  const { book_id, quantity } = req.body;
  const user_id = req.user.id;

  // Check if item already exists
  const existing = await pool.query(
    `SELECT * FROM "BOIPOTRO"."picked_items" WHERE user_id = $1 AND book_id = $2`,
    [user_id, book_id]
  );

  if (existing.rows.length > 0) {
    // Update quantity
    const updated = await pool.query(
      `UPDATE "BOIPOTRO"."picked_items" SET quantity = $1 WHERE user_id = $2 AND book_id = $3 RETURNING *`,
      [quantity, user_id, book_id]
    );
    res.json(updated.rows[0]);
  } else {
    const inserted = await pool.query(
      `INSERT INTO "BOIPOTRO"."picked_items" (user_id, book_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, book_id, quantity]
    );
    res.json(inserted.rows[0]);
  }
});

// @desc get cart items + calculated totals
// @route GET /api/cart
// @access Private
const getCartItems = asyncHandler(async (req, res) => {
  const user_id = req.user.id;

  const result = await pool.query(
    `SELECT c.id as cart_id, c.quantity, b.id , b.title, b.price, b.discount,bp.photo_url as image,b.stock
     FROM "BOIPOTRO"."picked_items" c
     JOIN "BOIPOTRO"."books" b ON c.book_id = b.id
     LEFT JOIN "BOIPOTRO"."book_photos" bp ON c.book_id=bp.book_id AND bp.photo_order=1
     WHERE c.user_id = $1`,
    [user_id]
  );

  const cartItems = result.rows;

  const {
    cartItems: updatedCartItems,
    itemsPrice,
    shippingPrice,
 
    totalPrice,
  } = calculateCartPrices(cartItems);  

  res.json({
    cartItems: updatedCartItems,
    itemsPrice,
    shippingPrice,
   
    totalPrice,
  });
});


// @desc delete book from cart
// @route DELETE /api/cart/:book_id
// @access Private
const removeFromCart = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { book_id } = req.params;

  await pool.query(
    `DELETE FROM "BOIPOTRO"."picked_items" WHERE user_id = $1 AND book_id = $2`,
    [user_id, book_id]
  );

  res.json({ message: "Item removed from cart" });
});


// @desc Clear entire cart
// @route DELETE /api/cart
// @access Private
const clearCart = asyncHandler(async (req, res) => {
  const user_id = req.user.id;

  await pool.query(
    `DELETE FROM "BOIPOTRO"."picked_items" WHERE user_id = $1`,
    [user_id]
  );

  res.json({ message: "Cart cleared successfully" });
});

export { addToCart, getCartItems, removeFromCart,clearCart };
