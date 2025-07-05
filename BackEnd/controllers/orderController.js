import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import generateToken from "../utils/generateToken.js";

// @desc       validate coupon
// @route      POST /api/orders/validateCoupon
// @access     private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cart_total } = req.body;
  const user_id = req.user.id;
  const now = new Date();

  const couponRes = await pool.query(
    `SELECT * FROM "BOIPOTRO"."coupons" WHERE code = $1`,
    [code]
  );

  if (couponRes.rowCount === 0) {
    return res.json({ valid: false, error: "Coupon not found" });
  }

  const coupon = couponRes.rows[0];

  const cartTotal = parseFloat(cart_total);
  const minOrderAmount = parseFloat(coupon.min_order_amount) || 0;

  // Validate date
  if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_until)) {
    return res.json({ valid: false, error: "Coupon expired" });
  }

  // Validate minimum order amount
  if (minOrderAmount > 0 && cartTotal < minOrderAmount) {
    return res.json({
      valid: false,
      error: `Minimum order amount is $${minOrderAmount}`,
    });
  }

  if (user_id) {
    // 🔎 Check if this user has been offered this coupon at all
    const usageRes = await pool.query(
      `SELECT used_count FROM "BOIPOTRO"."user_coupons"
     WHERE user_id = $1 AND coupon_id = $2`,
      [user_id, coupon.id]
    );

    if (usageRes.rowCount === 0) {
      return res.json({
        valid: false,
        error: "You are not eligible to use this coupon",
      });
    }

    //check usage limit
    const used = usageRes.rows[0].used_count || 0;
    if (coupon.usage_limit && used >= coupon.usage_limit) {
      return res.json({
        valid: false,
        error: "Coupon usage limit reached",
      });
    }
  }

  const percent = parseFloat(coupon.percentage_discount) || 0;
  const fixed = parseFloat(coupon.amount_discount) || 0;
  const max = parseFloat(coupon.maximum_discount) || Infinity;

  const percentAmount = (cartTotal * percent) / 100;
  const totalDiscount = Math.min(percentAmount + fixed, max);
  const newTotal = cartTotal - totalDiscount;

  res.json({
    valid: true,
    discount: {
      percentage: percent,
      fixed,
      maximum_discount: max,
      final_discount_amount: totalDiscount,
    },
    new_total: newTotal,
  });
});

// @desc       create new order
// @route      POST /api/orders
// @access     private
const addOrderItems = asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress, paymentMethod, couponName, totalPrice } =
    req.body;
  const user_id = req.user.id;

  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error("No cart items found");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let total_item = 0;
    for (const item of cartItems) {
      const qty = parseInt(item.qty, 10);
      total_item += qty;
    }

    let coupon_id = null;
    if (couponName) {
      const couponRes = await client.query(
        `SELECT id FROM "BOIPOTRO"."coupons" WHERE code = $1`,
        [couponName]
      );
      if (couponRes.rowCount > 0) {
        coupon_id = couponRes.rows[0].id;
      }
    }

    let payment_id = null;
    if (paymentMethod) {
      const paymentRes = await client.query(
        `SELECT id FROM "BOIPOTRO"."payments" WHERE method = $1`,
        [paymentMethod]
      );
      if (paymentRes.rowCount > 0) {
        payment_id = paymentRes.rows[0].id;
      }
    }

    // Insert into cart
    const cartRes = await client.query(
      `INSERT INTO "BOIPOTRO"."cart" (
         user_id, coupon_id, total_price, total_item, 
         shipping_address, state, payment_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        user_id,
        coupon_id,
        totalPrice,
        total_item,
        shippingAddress,
        "unpaid",
        payment_id,
      ]
    );

    const cart_id = cartRes.rows[0].id;

    for (const item of cartItems) {
      const bookId = parseInt(item.id, 10);
      const quantity = parseInt(item.qty, 10);

  
      await client.query(
        `INSERT INTO "BOIPOTRO"."cartitems" (cart_id, book_id, quantity)
         VALUES ($1, $2, $3)`,
        [cart_id, bookId, quantity]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created",
      cart_id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
});

// @desc       get logged in user orders
// @route      GET /api/orders/myorders
// @access     private
const getMyOrders = asyncHandler(async (req, res) => {
  res.send("get my orders");
});

// @desc       get order by id
// @route      GET /api/orders/:id
// @access     private
const getOrderById = asyncHandler(async (req, res) => {
  res.send("get order by id");
});

// @desc       Update order to paid
// @route      GET /api/orders/:id/pay
// @access     private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  res.send("Update order to paid");
});

// @desc       Update order to delivered
// @route      GET /api/orders/:id/deliver
// @access     private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  res.send("Update order to delivered");
});

// @desc       get all orders
// @route      GET /api/orders
// @access     private/Admin
const getOrders = asyncHandler(async (req, res) => {
  res.send("get all orders");
});

export {
  validateCoupon,
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  updateOrderToPaid,
  getOrders,
};
