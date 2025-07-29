import pool from "../db.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { calculateCartPrices } from "../utils/calculateCartPrices.js";

// @desc add a book to cart
// @route POST /api/cart
// @access Private
const addToCart = asyncHandler(async (req, res) => {
  const { book_id, quantity } = req.body;
  const user_id = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if item already exists
    const existing = await client.query(
      `SELECT * FROM "BOIPOTRO"."picked_items" WHERE user_id = $1 AND book_id = $2`,
      [user_id, book_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update quantity
      result = await client.query(
        `UPDATE "BOIPOTRO"."picked_items" SET quantity = $1 WHERE user_id = $2 AND book_id = $3 RETURNING *`,
        [quantity, user_id, book_id]
      );
    } else {
      // Check if book exists and has enough stock
      const bookCheck = await client.query(
        `SELECT stock FROM "BOIPOTRO"."books" WHERE id = $1`,
        [book_id]
      );
      
      if (bookCheck.rows.length === 0) {
        throw new Error('Book not found');
      }
      
      if (bookCheck.rows[0].stock < quantity) {
        throw new Error('Not enough stock available');
      }

      result = await client.query(
        `INSERT INTO "BOIPOTRO"."picked_items" (user_id, book_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
        [user_id, book_id, quantity]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({
      message: error.message || 'Error adding item to cart',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// @desc get cart items + calculated totals
// @route GET /api/cart
// @access Private
const getCartItems = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const result = await client.query(
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

    await client.query('COMMIT');
    res.json({
      cartItems: updatedCartItems,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({
      message: 'Error fetching cart items',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});


// @desc delete book from cart
// @route DELETE /api/cart/:book_id
// @access Private
const removeFromCart = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { book_id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `DELETE FROM "BOIPOTRO"."picked_items" WHERE user_id = $1 AND book_id = $2 RETURNING *`,
      [user_id, book_id]
    );

    if (result.rowCount === 0) {
      throw new Error('Item not found in cart');
    }

    await client.query('COMMIT');
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(error.message === 'Item not found in cart' ? 404 : 500).json({
      message: error.message || 'Error removing item from cart',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});


// @desc Clear entire cart
// @route DELETE /api/cart
// @access Private
const clearCart = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `DELETE FROM "BOIPOTRO"."picked_items" WHERE user_id = $1 RETURNING *`,
      [user_id]
    );

    if (result.rowCount === 0) {
      throw new Error('Cart is already empty');
    }

    await client.query('COMMIT');
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(error.message === 'Cart is already empty' ? 400 : 500).json({
      message: error.message || 'Error clearing cart',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

export { addToCart, getCartItems, removeFromCart,clearCart };
