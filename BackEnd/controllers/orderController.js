import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import generateToken from "../utils/generateToken.js";
import { v4 as uuidv4 } from "uuid";
import { calculateCartPrices } from "../utils/calculateCartPrices.js";

// @desc       validate coupon
// @route      POST /api/orders/validateCoupon
// @access     private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res
      .status(400)
      .json({ valid: false, error: "Coupon code is required" });
  }

  const user_id = req.user.id;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get cart items
    const result = await client.query(
      `SELECT c.id as cart_id, c.quantity, b.id as book_id, b.title, b.price, b.discount
       FROM "BOIPOTRO"."picked_items" c
       JOIN "BOIPOTRO"."books" b ON c.book_id = b.id
       WHERE c.user_id = $1`,
      [user_id]
    );

    const cartItems = result.rows;
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate total price
    const { totalPrice } = calculateCartPrices(cartItems);
    const now = new Date();

    // Get coupon details
    const couponRes = await client.query(
      `SELECT * FROM "BOIPOTRO"."coupons" WHERE code = $1`,
      [code]
    );

    if (couponRes.rowCount === 0) {
      throw new Error("Coupon not found");
    }

    const coupon = couponRes.rows[0];

    const cartTotal = parseFloat(totalPrice);
    const minOrderAmount = parseFloat(coupon.min_order_amount) || 0;

    // Validate date
    if (
      now < new Date(coupon.valid_from) ||
      now > new Date(coupon.valid_until)
    ) {
      throw new Error("Coupon expired");
    }

    // Validate minimum order amount
    if (minOrderAmount > 0 && cartTotal < minOrderAmount) {
      throw new Error(`Minimum order amount is $${minOrderAmount}`);
    }

    // Check coupon eligibility and usage
    const usageRes = await client.query(
      `SELECT used_count FROM "BOIPOTRO"."user_coupons"
       WHERE user_id = $1 AND coupon_id = $2`,
      [user_id, coupon.id]
    );

    if (usageRes.rowCount === 0) {
      throw new Error("You are not eligible to use this coupon");
    }

    // Check usage limit
    const used = usageRes.rows[0].used_count || 0;
    if (coupon.usage_limit && used >= coupon.usage_limit) {
      throw new Error("Coupon usage limit reached");
    }

    await client.query("COMMIT");

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
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({
      valid: false,
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    client.release();
  }
});

export const createOrder = async ({
  user_id,
  cartItems,
  shippingAddress,
  paymentMethod,
  couponName,
  totalPrice,
  tran_id,
  is_paid,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let total_item = 0;
    for (const item of cartItems) {
      const qty = parseInt(item.quantity, 10);
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

    const cartRes = await client.query(
      `INSERT INTO "BOIPOTRO"."cart" (
         user_id, coupon_id, total_price, total_item, 
         shipping_address, payment_method, tran_id, is_paid, state_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
       RETURNING id`,
      [
        user_id,
        coupon_id,
        totalPrice,
        total_item,
        shippingAddress,
        paymentMethod,
        tran_id,
        is_paid,
      ]
    );

    const cart_id = cartRes.rows[0].id;

    for (const item of cartItems) {
      const bookId = parseInt(item.id, 10);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(bookId) || isNaN(quantity)) {
        throw new Error("Invalid bookId or quantity in cartItems");
      }

      // Lock the book row to prevent race condition
      const stockRes = await client.query(
        `SELECT stock FROM "BOIPOTRO"."books" WHERE id = $1 FOR UPDATE`,
        [bookId]
      );

      if (stockRes.rowCount === 0) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      const currentStock = parseInt(stockRes.rows[0].stock, 10);
      if (currentStock < quantity) {
        throw new Error(`Not enough stock for book ID ${bookId}`);
      }

      // Safe to update now
      await client.query(
        `UPDATE "BOIPOTRO"."books" SET stock = stock - $1 WHERE id = $2`,
        [quantity, bookId]
      );

      await client.query(
        `INSERT INTO "BOIPOTRO"."cartitems" (cart_id, book_id, quantity)
     VALUES ($1, $2, $3)`,
        [cart_id, bookId, quantity]
      );
    }

    // for (const item of cartItems) {
    //   const bookId = parseInt(item.id, 10);
    //   const quantity = parseInt(item.quantity, 10);
    //   if (isNaN(bookId) || isNaN(quantity)) {
    //     throw new Error("Invalid bookId or quantity in cartItems");
    //   }

    //   await client.query(
    //     `INSERT INTO "BOIPOTRO"."cartitems" (cart_id, book_id, quantity)
    //      VALUES ($1, $2, $3)`,
    //     [cart_id, bookId, quantity]
    //   );
    // }

    await client.query(
      `UPDATE "BOIPOTRO"."user_coupons" SET used_count = used_count + 1
       WHERE user_id = $1 AND coupon_id = $2`,
      [user_id, coupon_id]
    );

    await client.query(
      `DELETE FROM "BOIPOTRO"."picked_items" WHERE user_id = $1`,
      [user_id]
    );

    await client.query("COMMIT");

    return cart_id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// @desc       create new order
// @route      POST /api/orders
// @access     private

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    cartItems,
    shippingAddress,
    paymentMethod,
    couponName,
    totalPrice,
    is_paid,
  } = req.body;

  const user_id = req.user.id;
  let tran_id = req.body.tran_id || uuidv4();
  const orderIsPaid = is_paid !== undefined ? is_paid : !!req.body.tran_id;

  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error("No cart items found");
  }

  const cart_id = await createOrder({
    user_id,
    cartItems,
    shippingAddress,
    paymentMethod,
    couponName,
    totalPrice,
    tran_id,
    is_paid: orderIsPaid,
  });

  res.status(201).json({ message: "Order created", id: cart_id });
});

// const addOrderItems = asyncHandler(async (req, res) => {

//   console.log("add order called");
//   const { cartItems, shippingAddress, paymentMethod, couponName, totalPrice } =
//     req.body;

//   const user_id = req.user.id;
//   let is_paid = true;

//   let tran_id = req.body.tran_id || "";
//   if (tran_id === "") {
//     tran_id = uuidv4();
//     is_paid = false;
//   }

//   if (!cartItems || cartItems.length === 0) {
//     res.status(400);
//     throw new Error("No cart items found");
//   }

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     let total_item = 0;
//     for (const item of cartItems) {
//       const qty = parseInt(item.quantity, 10);
//       total_item += qty;
//     }

//     let coupon_id = null;
//     if (couponName) {
//       const couponRes = await client.query(
//         `SELECT id FROM "BOIPOTRO"."coupons" WHERE code = $1`,
//         [couponName]
//       );
//       if (couponRes.rowCount > 0) {
//         coupon_id = couponRes.rows[0].id;
//       }
//     }

//     // let payment_id = null;
//     // if (paymentMethod) {
//     //   const paymentRes = await client.query(
//     //     `SELECT id FROM "BOIPOTRO"."payments" WHERE method = $1`,
//     //     [paymentMethod]
//     //   );
//     //   if (paymentRes.rowCount > 0) {
//     //     payment_id = paymentRes.rows[0].id;
//     //   }
//     // }

//     // Insert into cart
//     const cartRes = await client.query(
//       `INSERT INTO "BOIPOTRO"."cart" (
//          user_id, coupon_id, total_price, total_item,
//          shipping_address, payment_method,tran_id,is_paid,state_id
//        ) VALUES ($1, $2, $3, $4, $5, $6, $7,$8, 1)
//        RETURNING id`,
//       [
//         user_id,
//         coupon_id,
//         totalPrice,
//         total_item,
//         shippingAddress,
//         paymentMethod,
//         tran_id,
//         is_paid,
//       ]
//     );

//     const cart_id = cartRes.rows[0].id;

//     for (const item of cartItems) {
//       const bookId = parseInt(item.id, 10);
//       const quantity = parseInt(item.quantity, 10);

//       if (isNaN(bookId) || isNaN(quantity)) {
//         throw new Error("Invalid bookId or quantity in cartItems");
//       }

//       await client.query(
//         `INSERT INTO "BOIPOTRO"."cartitems" (cart_id, book_id, quantity)
//          VALUES ($1, $2, $3)`,
//         [cart_id, bookId, quantity]
//       );
//     }

//     //await pool.query(`DELETE FROM "BOIPOTRO"."picked_items" WHERE user_id = $1`, [user_id]);
//     await client.query(
//       `DELETE FROM "BOIPOTRO"."picked_items" WHERE user_id = $1`,
//       [user_id]
//     );

//     await client.query("COMMIT");

//     res.status(201).json({
//       message: "Order created",
//       id: cart_id,
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("Order creation failed:", err);
//     res.status(500).json({ error: "Failed to create order" });
//     return;
//   } finally {
//     client.release();
//   }
// });

// @desc       get logged in user orders
// @route      GET /api/orders/mine
// @access     private
const getMyOrders = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // First verify the user exists
    const userCheck = await client.query(
      `SELECT id FROM "BOIPOTRO"."users" WHERE id = $1`,
      [user_id]
    );

    if (userCheck.rowCount === 0) {
      throw new Error("User not found");
    }

    const ordersRes = await client.query(
      `SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address, 
              c.state_id, c.created_at, c.payment_method AS payment_method, 
              c.is_paid, cp.code AS coupon_code,
              cs.name AS state_name
       FROM "BOIPOTRO"."cart" c
       LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
       LEFT JOIN "BOIPOTRO"."cart_states" cs ON c.state_id = cs.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    // Enrich with order items if needed
    const enrichedOrders = await Promise.all(
      ordersRes.rows.map(async (order) => {
        const itemsRes = await client.query(
          `SELECT ci.book_id, b.title, ci.quantity, b.price
           FROM "BOIPOTRO"."cartitems" ci
           JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
           WHERE ci.cart_id = $1`,
          [order.cart_id]
        );
        return { ...order, items: itemsRes.rows };
      })
    );

    await client.query("COMMIT");
    res.status(200).json(enrichedOrders);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to fetch user's orders:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({
      error: error.message || "Could not fetch orders",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    client.release();
  }
});

// @desc       get order by id
// @route      GET /api/orders/:id
// @access     private

const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  const user_id = req.user.id;
  const isAdmin = req.user.isadmin;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Prepare the base query
    const baseQuery = `
      SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address, 
             c.state_id, c.created_at, c.payment_method, cp.code AS coupon_code,
             u.name AS user_name, u.email AS user_email, cs.name AS state_name,
             c.is_paid, c.tran_id
      FROM "BOIPOTRO"."cart" c
      JOIN "BOIPOTRO"."users" u ON c.user_id = u.id
      LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
      LEFT JOIN "BOIPOTRO"."cart_states" cs ON cs.id = c.state_id`;

    // Execute appropriate query based on user role
    const cartRes = await client.query(
      isAdmin
        ? `${baseQuery} WHERE c.id = $1`
        : `${baseQuery} WHERE c.id = $1 AND c.user_id = $2`,
      isAdmin ? [orderId] : [orderId, user_id]
    );

    if (cartRes.rowCount === 0) {
      throw new Error(
        isAdmin ? "Order not found" : "Order not found or access denied"
      );
    }

    // Get order items with full details
    const itemsRes = await client.query(
      `SELECT ci.book_id, b.title, b.price, ci.quantity, bp.photo_url,
              b.discount, b.stock
       FROM "BOIPOTRO"."cartitems" ci
       JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
       LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.id
       WHERE ci.cart_id = $1`,
      [orderId]
    );

    // Calculate item totals
    const items = itemsRes.rows.map((item) => ({
      ...item,
      total: parseFloat(item.price) * parseInt(item.quantity),
      final_price:
        parseFloat(item.price) * (1 - parseFloat(item.discount || 0)),
    }));

    await client.query("COMMIT");

    res.status(200).json({
      ...cartRes.rows[0],
      items,
      total_items: items.reduce(
        (sum, item) => sum + parseInt(item.quantity),
        0
      ),
      items_total: items.reduce((sum, item) => sum + item.total, 0),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to fetch order:", error);
    res.status(error.message.includes("not found") ? 404 : 500).json({
      error: error.message || "Could not fetch order details",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    client.release();
  }
});

// const getOrderById = asyncHandler(async (req, res) => {
//   const orderId = req.params.id;
//   const user_id = req.user.id;

//   const client = await pool.connect();
//   try {
//     // 1. Get cart (order) info
//     const cartRes = await client.query(
//       `SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address,
//               c.state, c.created_at, p.method AS payment_method, cp.code AS coupon_code
//        FROM "BOIPOTRO"."cart" c
//        LEFT JOIN "BOIPOTRO"."payments" p ON c.payment_id = p.id
//        LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
//        WHERE c.id = $1 AND c.user_id = $2`,
//       [orderId, user_id]
//     );

//     if (cartRes.rowCount === 0) {
//       res.status(404);
//       throw new Error("Order not found");
//     }

//     // 2. Get ordered items
//     const itemsRes = await client.query(
//       `SELECT ci.book_id, b.title, b.price, ci.quantity,bp.photo_url
//        FROM "BOIPOTRO"."cartitems" ci
//        JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
//        JOIN "BOIPOTRO"."book_photos" bp ON b.id=bp.id
//        WHERE ci.cart_id = $1`,
//       [orderId]
//     );

//     const userRes = await client.query(
//       `SELECT u.name,u.email
//       FROM "BOIPOTRO"."users" u
//       WHERE u.id=$1`,
//       [user_id]
//     );

//     res.status(200).json({
//       ...cartRes.rows[0],
//       items: itemsRes.rows,
//       user:userRes.rows[0],
//     });
//   } catch (err) {
//     console.error("Failed to fetch order:", err);
//     res.status(500).json({ error: "Could not fetch order details" });
//   } finally {
//     client.release();
//   }
// });

// @desc       Update order to paid
// @route      GET /api/orders/:id/pay
// @access     private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  res.send("Update order to paid");
});

// @desc       Cancel order (user can cancel unpaid orders within 6 hours)
// @route      PUT /api/orders/:id/cancel
// @access     private
const cancelOrder = asyncHandler(async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;

  const client = await pool.connect();

  try {
    // Get order details
    const orderResult = await client.query(
      `SELECT c.id, c.user_id, c.is_paid, c.created_at, c.state_id, cs.name as state_name, c.payment_method
       FROM "BOIPOTRO"."cart" c
       JOIN "BOIPOTRO"."cart_states" cs ON c.state_id = cs.id
       WHERE c.id = $1`,
      [cartId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    // Check if user owns this order
    if (order.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to cancel this order" });
    }

    // Check if order is already cancelled
    if (order.state_name === "cancelled") {
      return res.status(400).json({ error: "Order is already cancelled" });
    }

    // Check if order is paid or is SSLCommerz
    if (order.is_paid || order.payment_method === "SSLCommerz") {
      return res
        .status(400)
        .json({
          error: "Cannot cancel paid orders or orders paid with SSLCommerz",
        });
    }

    // Check if order is in cancellable states (pending or processing)
    if (!["pending", "processing"].includes(order.state_name)) {
      return res
        .status(400)
        .json({ error: "Order cannot be cancelled in current state" });
    }

    // Check if order is within 6 hours
    const orderTime = new Date(order.created_at);
    const currentTime = new Date();
    const timeDifference = currentTime - orderTime;
    const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    if (timeDifference > sixHoursInMs) {
      return res
        .status(400)
        .json({
          error: "Order can only be cancelled within 6 hours of placement",
        });
    }

    // Get cancelled state ID
    const cancelledStateResult = await client.query(
      `SELECT id FROM "BOIPOTRO"."cart_states" WHERE name = 'cancelled'`
    );
    const cancelledStateId = cancelledStateResult.rows[0].id;

    // Update order state to cancelled
    await client.query(
      `UPDATE "BOIPOTRO"."cart" SET state_id = $1 WHERE id = $2`,
      [cancelledStateId, cartId]
    );

    // 1. Get all items in the order
    const itemsResult = await client.query(
      `SELECT book_id, quantity FROM "BOIPOTRO"."cartitems" WHERE cart_id = $1`,
      [cartId]
    );

    // 2. For each item, increase the stock in the books table
    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE "BOIPOTRO"."books" SET stock = stock + $1 WHERE id = $2`,
        [item.quantity, item.book_id]
      );
    }

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Failed to cancel order:", err);
    res.status(500).json({ error: "Could not cancel order" });
  } finally {
    client.release();
  }
});

// @desc       Update order state
// @route      PUT /api/orders/:id/state
// @access     private/Admin
const updateOrderState = asyncHandler(async (req, res) => {
  if (!req.user?.isadmin) {
    return res.status(403).json({ error: "Not authorized as admin" });
  }

  const cartId = req.params.id;
  const { state } = req.body;

  if (!state) {
    return res.status(400).json({ error: "State is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if order exists
    const orderResult = await client.query(
      `SELECT c.id, c.state_id, cs.name as current_state
       FROM "BOIPOTRO"."cart" c
       JOIN "BOIPOTRO"."cart_states" cs ON c.state_id = cs.id
       WHERE c.id = $1`,
      [cartId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error("Order not found");
    }

    // Check if valid state
    const stateResult = await client.query(
      `SELECT id FROM "BOIPOTRO"."cart_states" WHERE name = $1`,
      [state]
    );

    if (stateResult.rows.length === 0) {
      throw new Error("Invalid state");
    }

    const stateId = stateResult.rows[0].id;
    const currentState = orderResult.rows[0].current_state;

    // Validate state transition
    if (currentState === "cancelled" && state !== "cancelled") {
      throw new Error("Cannot change state of cancelled order");
    }

    if (currentState === "delivered" && state !== "delivered") {
      throw new Error("Cannot change state of delivered order");
    }

    // Update cart state
    await client.query(
      `UPDATE "BOIPOTRO"."cart" SET state_id = $1 WHERE id = $2`,
      [stateId, cartId]
    );

    await client.query("COMMIT");
    res.json({
      message: `Order ${cartId} state updated from ${currentState} to ${state}`,
      orderId: cartId,
      previousState: currentState,
      newState: state,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to update order state:", error);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    client.release();
  }
});

// @desc       Get all orders (admin only)
// @route      GET /api/orders
// @access     private/Admin
const getOrders = asyncHandler(async (req, res) => {
  if (!req.user?.isadmin) {
    return res.status(403).json({ error: "Not authorized as admin" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get all orders with user and state info
    const ordersRes = await client.query(
      `SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address,
              c.state_id, c.created_at, u.name AS user_name, u.email AS user_email,
              c.payment_method, c.is_paid, cs.name AS state_name, cp.code AS coupon_code
       FROM "BOIPOTRO"."cart" c
       JOIN "BOIPOTRO"."users" u ON c.user_id = u.id
       LEFT JOIN "BOIPOTRO"."cart_states" cs ON c.state_id = cs.id
       LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
       ORDER BY c.created_at DESC`
    );

    // Efficiently fetch items for all orders using Promise.all
    const enrichedOrders = await Promise.all(
      ordersRes.rows.map(async (order) => {
        const itemsRes = await client.query(
          `SELECT ci.book_id, b.title, b.price, ci.quantity, bp.photo_url
           FROM "BOIPOTRO"."cartitems" ci
           JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
           LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.id
           WHERE ci.cart_id = $1`,
          [order.cart_id]
        );

        return {
          ...order,
          items: itemsRes.rows,
        };
      })
    );

    await client.query("COMMIT");
    res.status(200).json(enrichedOrders);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to fetch all orders:", error);
    res.status(500).json({
      error: "Could not fetch all orders",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    client.release();
  }
});

export {
  validateCoupon,
  addOrderItems,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderState,
  updateOrderToPaid,
  getOrders,
};
