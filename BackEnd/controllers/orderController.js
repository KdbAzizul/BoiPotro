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
  const user_id = req.user.id;

  const result = await pool.query(
    `SELECT c.id as cart_id, c.quantity, b.id as book_id, b.title, b.price, b.discount
     FROM "BOIPOTRO"."picked_items" c
     JOIN "BOIPOTRO"."books" b ON c.book_id = b.id
     WHERE c.user_id = $1`,
    [user_id]
  );

  const cartItems = result.rows;

  const { totalPrice } = calculateCartPrices(cartItems);
  const now = new Date();

  const couponRes = await pool.query(
    `SELECT * FROM "BOIPOTRO"."coupons" WHERE code = $1`,
    [code]
  );

  if (couponRes.rowCount === 0) {
    return res.json({ valid: false, error: "Coupon not found" });
  }

  const coupon = couponRes.rows[0];

  const cartTotal = parseFloat(totalPrice);
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

      await client.query(
        `INSERT INTO "BOIPOTRO"."cartitems" (cart_id, book_id, quantity)
         VALUES ($1, $2, $3)`,
        [cart_id, bookId, quantity]
      );
    }

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
  const { cartItems, shippingAddress, paymentMethod, couponName, totalPrice, is_paid } = req.body;

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
    const ordersRes = await client.query(
      `SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address, 
              c.state_id, c.created_at, c.payment_method AS payment_method, cp.code AS coupon_code,
              cs.name AS state_name
       FROM "BOIPOTRO"."cart" c
      
       LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
       LEFT JOIN "BOIPOTRO"."cart_states" cs ON c.state_id=cs.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    res.status(200).json(ordersRes.rows);
  } catch (err) {
    console.error("Failed to fetch user's orders:", err);
    res.status(500).json({ error: "Could not fetch orders" });
  } finally {
    client.release();
  }
});

// @desc       get order by id
// @route      GET /api/orders/:id
// @access     private

const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const user_id = req.user.id;
  const isAdmin = req.user.isadmin;

  const client = await pool.connect();
  try {
    let cartRes;
    if (isAdmin) {
      cartRes = await client.query(
        `SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address, 
                c.state_id, c.created_at, c.payment_method, cp.code AS coupon_code,
                u.name AS user_name, u.email AS user_email,cs.name AS state_name
         FROM "BOIPOTRO"."cart" c
         JOIN "BOIPOTRO"."users" u ON c.user_id = u.id
         
         LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
         LEFT JOIN "BOIPOTRO"."cart_states" cs on cs.id=c.state_id
         WHERE c.id = $1`,
        [orderId]
      );
    } else {
      cartRes = await client.query(
        `SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address, 
                c.state_id, c.created_at, c.payment_method, cp.code AS coupon_code,
                u.name AS user_name, u.email AS user_email,cs.name AS state_name
         FROM "BOIPOTRO"."cart" c
         JOIN "BOIPOTRO"."users" u ON c.user_id = u.id
       
         LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
         LEFT JOIN "BOIPOTRO"."cart_states" cs on cs.id=c.state_id
         WHERE c.id = $1 AND c.user_id = $2`,
        [orderId, user_id]
      );
    }

    if (cartRes.rowCount === 0) {
      res.status(404);
      throw new Error("Order not found");
    }

    const itemsRes = await client.query(
      `SELECT ci.book_id, b.title, b.price, ci.quantity, bp.photo_url
       FROM "BOIPOTRO"."cartitems" ci
       JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
       LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.id
       WHERE ci.cart_id = $1`,
      [orderId]
    );

    res.status(200).json({
      ...cartRes.rows[0],
      items: itemsRes.rows,
    });
  } catch (err) {
    console.error("Failed to fetch order:", err);
    res.status(500).json({ error: "Could not fetch order details" });
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

// @desc       Update order state
// @route      GET /api/orders/:id/state
// @access     private/Admin
const updateOrderState = async (req, res) => {
  const cartId = req.params.id;
  const { state } = req.body;

  // Check if valid state
  const stateResult = await pool.query(
    `SELECT id FROM "BOIPOTRO"."cart_states" WHERE name = $1`,
    [state]
  );
  if (stateResult.rows.length === 0)
    return res.status(400).json({ error: "Invalid state" });

  const stateId = stateResult.rows[0].id;

  // Update cart state
  await pool.query(`UPDATE "BOIPOTRO"."cart" SET state_id = $1 WHERE id = $2`, [
    stateId,
    cartId,
  ]);

  res.json({ message: `Cart ${cartId} state updated to ${state}` });
};

// @desc       Get all orders (admin only)
// @route      GET /api/orders
// @access     private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const client = await pool.connect();

  try {
    const ordersRes = await client.query(
      `SELECT c.id AS cart_id, c.total_price, c.total_item, c.shipping_address,
              c.state_id, c.created_at, u.name AS user_name, u.email AS user_email,
              c.payment_method, cp.code AS coupon_code
       FROM "BOIPOTRO"."cart" c
       JOIN "BOIPOTRO"."users" u ON c.user_id = u.id
       
       LEFT JOIN "BOIPOTRO"."coupons" cp ON c.coupon_id = cp.id
       ORDER BY c.created_at DESC`
    );

    const enrichedOrders = [];

    // Loop over orders and fetch cart items for each
    for (const order of ordersRes.rows) {
      const itemsRes = await client.query(
        `SELECT ci.book_id, b.title, b.price, ci.quantity, bp.photo_url
         FROM "BOIPOTRO"."cartitems" ci
         JOIN "BOIPOTRO"."books" b ON ci.book_id = b.id
         LEFT JOIN "BOIPOTRO"."book_photos" bp ON b.id = bp.id
         WHERE ci.cart_id = $1`,
        [order.cart_id]
      );

      enrichedOrders.push({
        ...order,
        items: itemsRes.rows,
      });
    }

    res.status(200).json(enrichedOrders);
    console.log("fetched all orders");
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    res.status(500).json({ error: "Could not fetch all orders" });
  } finally {
    client.release();
  }
});

export {
  validateCoupon,
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderState,
  updateOrderToPaid,
  getOrders,
};
