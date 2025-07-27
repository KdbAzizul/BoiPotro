import SSLCommerzPayment from "sslcommerz-lts";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { addOrderItems, createOrder } from "./orderController.js";
import axios from "axios";

const store_id = process.env.SSLCZ_STORE_ID;
const store_passwd = process.env.SSLCZ_STORE_PASSWD;
const is_live = false;

export const initSSLCOMMERZ = async (req, res) => {
  const { cartItems, shippingAddress, couponName, totalPrice } = req.body;

  const user_id = req.user.id;
  const tran_id = uuidv4();

  const totalAmount = totalPrice;

  try {
    // Save the temporary order in DB
    await pool.query(
      `INSERT INTO "BOIPOTRO"."temp_orders" (
         tran_id, user_id, cart_items, shipping_address,
         coupon_name, total_price
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        tran_id,
        user_id,
        JSON.stringify(cartItems),
        shippingAddress,

        couponName,
        totalPrice,
      ]
    );

    console.log("Expected Tran ID:", tran_id);
    const data = {
      total_amount: totalAmount,
      currency: "BDT",
      tran_id: tran_id,
      success_url: `http://localhost:5000/api/payment/success/${tran_id}`,
      fail_url: `http://localhost:5000/api/payment/fail/${tran_id}`,
      cancel_url: `http://localhost:5000/api/payment/cancel/${tran_id}`,
      ipn_url: `https://boipotro.onrender.com/api/payment/ipn`,

      shipping_method: "Courier",

      product_name: "BOIPOTRO Order",
      product_category: "Books",
      product_profile: "general",

      // Customer (Billing) Info
      cus_name: shippingAddress.fullName || "Customer",
      cus_email: "guest@example.com",
      cus_add1: shippingAddress.address,
      cus_city: shippingAddress.city,
      cus_postcode: shippingAddress.postalCode,
      cus_country: shippingAddress.country,
      cus_phone: shippingAddress.phone || "01700000000",

      // Shipping Info — use same as above if customer and shipping are same
      ship_name: shippingAddress.fullName || "Customer",
      ship_add1: shippingAddress.address,
      ship_city: shippingAddress.city,
      ship_postcode: shippingAddress.postalCode,
      ship_country: shippingAddress.country,

      // Optional metadata
      value_a: user_id?.toString() || "guest",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    //console.log("🔁 SSLCommerz API Response:", apiResponse);

    if (apiResponse?.GatewayPageURL) {
      res.json(apiResponse);
    } else {
      res.status(500).json({ message: "Failed to initialize payment gateway" });
    }
  } catch (err) {
    console.error("Payment Init Error:", err);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

// export const sslcommerzIPN = async (req, res) => {
//   console.log('ssl is called');
//   const { tran_id, card_type, card_issuer, status } = req.body;
//   console.log(req.body);
//   const paymentMethod = card_type || card_issuer || "Unknown";

//   if (!tran_id || !status) {
//     return res.status(400).json({ message: "Invalid IPN data" });
//   }

//   try {
//     if (status === "VALID") {
//       const tempResult = await pool.query(
//         `SELECT * FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
//         [tran_id]
//       );

//       if (tempResult.rowCount === 0) {
//         return res.status(404).json({ message: "Temp order not found" });
//       }

//       const tempOrder = tempResult.rows[0];

//       const fakeReq = {
//         body: {
//           cartItems: tempOrder.cart_items,
//           shippingAddress: tempOrder.shipping_address,
//           paymentMethod,
//           couponName: tempOrder.coupon_name,
//           totalPrice: tempOrder.total_price,
//           tran_id,
//         },
//         user: { id: tempOrder.user_id },
//       };

//       // Mock response (addOrderItems expects res)
//       const fakeRes = {
//         status: () => fakeRes,
//         json: (data) => { fakeRes.data = data; },
//       };

//       await addOrderItems(fakeReq, fakeRes);
//       const cart_id = fakeRes?.data?.id;

//       await pool.query(
//         `INSERT INTO "BOIPOTRO"."payment_logs" (
//           tran_id, user_id, amount, card_type, cart_id
//         ) VALUES ($1, $2, $3, $4, $5)`,
//         [tran_id, tempOrder.user_id, tempOrder.total_price, paymentMethod, cart_id]
//       );

//       await pool.query(
//         `DELETE FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
//         [tran_id]
//       );

//       return res.status(200).json({ message: "IPN processed successfully" });
//     } else {
//       return res.status(400).json({ message: "Payment not valid" });
//     }
//   } catch (err) {
//     console.error("IPN Processing Failed:", err);
//     return res.status(500).json({ message: "IPN processing error" });
//   }
// };
// paymentController.js
export const sslcommerzIPN = async (req, res) => {
  const paymentData = req.body;

  const {
    status,
    tran_id,
    val_id,
    card_type,
    amount,
    currency,
    store_amount,
    bank_tran_id,
    card_issuer,
    card_brand,
    card_sub_brand,
    card_issuer_country,
    card_issuer_country_code,
    verify_sign,
    verify_key,
    risk_level,
    risk_title,
    // ...more fields
  } = paymentData;

  console.log("IPN received for tran_id:", tran_id);
  console.log("Full payment data:", paymentData);

  // validate tran_id from DB and then confirm the payment
  // update orders, save logs, etc.

  res.status(200).send("IPN received");
};

// export const sslcommerzIPN = async (req, res) => {
//   // Validate IPN and update order status
//   console.log("📥 SSLCommerz IPN received:", req.body);
//   res.status(200).json({ message: "IPN received" });
// };
// export const sslcommerzIPN = async (req, res) => {
//   const { val_id } = req.body;  // In case it's in the body, not query
//   const store_id = process.env.SSLC_STORE_ID;
//   const store_passwd = process.env.SSLC_STORE_PASS;

//   if (!val_id) {
//     return res.status(400).json({ message: "val_id is missing" });
//   }

//   const validatorURL = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(val_id)}&store_id=${store_id}&store_passwd=${store_passwd}&v=1&format=json`;

//   try {
//     const sslRes = await axios.get(validatorURL);
//     const sslData = sslRes.data;

//     if (sslData.status === "VALID") {
//       console.log("Valid Transaction:", sslData);
//       // Process transaction details
//     } else {
//       console.error("Invalid Transaction", sslData);
//     }
//   } catch (err) {
//     console.error("Failed to validate IPN:", err);
//   }

//   res.status(200).send("IPN received");
// };
// export const sslcommerzIPN = async (req, res) => {
//   const { tran_id, card_type, card_issuer, amount, status } = req.body;

//   const paymentMethod = card_type || card_issuer || "Unknown";
//   console.log("Payment Method:", paymentMethod);
//   // console.log("📥 IPN received:", req.body);

//   if (!tran_id || !status) {
//     return res.status(400).json({ message: "Invalid IPN data" });
//   }

//   try {
//     if (status === "VALID") {
//       // 1. Get temp order
//       const tempResult = await pool.query(
//         `SELECT * FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
//         [tran_id]
//       );

//       if (tempResult.rowCount === 0) {
//         return res.status(404).json({ message: "Temp order not found" });
//       }

//       const tempOrder = tempResult.rows[0];

//       // 2. Create actual order
//       const fakeReq = {
//             body: {
//               cartItems: tempOrder.cart_items,
//               shippingAddress: tempOrder.shipping_address,
//               paymentMethod: paymentMethod,
//               couponName: tempOrder.coupon_name,
//               totalPrice: tempOrder.total_price,
//               tran_id: tran_id,
//             },
//             user: { id: tempOrder.user_id },
//           };
//       const fakeRes = {
//         status: () => fakeRes,
//         json: (data) => {},
//       };
//        await addOrderItems(fakeReq, fakeRes);
//       console.log("Cart ID:", data.id);

//       // 3. Log payment
//       await pool.query(
//         `INSERT INTO "BOIPOTRO"."payment_logs" (
//           tran_id, user_id, amount, card_type, cart_id
//         ) VALUES ($1, $2, $3, $4, $5)`,
//         [tran_id, tempOrder.user_id, tempOrder.total_price, paymentMethod, cart_id]
//       );

//       // 4. Clean up
//       await pool.query(
//         `DELETE FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
//         [tran_id]
//       );

//       return res.status(200).json({ message: "IPN processed successfully" });
//     } else {
//       console.warn("IPN reported failed status:", status);
//       return res.status(400).json({ message: "Payment not valid" });
//     }
//   } catch (err) {
//     console.error("IPN Processing Failed:", err);
//     return res.status(500).json({ message: "IPN processing error" });
//   }
// };

export const paymentSuccess = async (req, res) => {
  const { tran_id } = req.params;
  //const { val_id } = req.query;

  // console.log("VAL_ID:", val_id); // should not be undefined
  // if (!val_id) {
  //   return res.status(400).json({ message: "val_id is missing" });
  // }

  // const store_id = process.env.SSLC_STORE_ID;
  // const store_passwd = process.env.SSLC_STORE_PASS;

  // const validatorURL = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(
  //   val_id
  // )}&store_id=${store_id}&store_passwd=${store_passwd}&v=1&format=json`;

  // const sslRes = await axios.get(validatorURL);
  // const sslData = sslRes.data;

  // console.log("Validated SSL Data:", sslData);

  const card_type =  "SSLCommerz";

  try {
    const tempRes = await pool.query(
      `SELECT * FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
      [tran_id]
    );

    if (tempRes.rowCount === 0) {
      return res.status(404).json({ message: "Temp order not found" });
    }

    const tempOrder = tempRes.rows[0];

    const cart_id = await createOrder({
      user_id: tempOrder.user_id,
      cartItems: tempOrder.cart_items,
      shippingAddress: tempOrder.shipping_address,
      paymentMethod: card_type,
      couponName: tempOrder.coupon_name,
      totalPrice: tempOrder.total_price,
      tran_id: tran_id,
      is_paid: true,
    });

    console.log("✅ Created cart ID:", cart_id);

    await pool.query(
      `INSERT INTO "BOIPOTRO"."payment_logs" (
         tran_id, user_id, amount, card_type, cart_id
       ) VALUES ($1, $2, $3, $4, $5)`,
      [tran_id, tempOrder.user_id, tempOrder.total_price, card_type, cart_id]
    );

    await pool.query(
      `DELETE FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
      [tran_id]
    );

    return res.redirect(`http://localhost:5173/order/${cart_id}`);
  } catch (err) {
    console.error("⚠️ Failed to finalize payment:", err);
    if (!res.headersSent) {
      return res.redirect(`http://localhost:5173/placeorder`);
    }
  }
};

// export const paymentSuccess = async (req, res) => {
//   const { tran_id } = req.params;
//   const card_type = req.query.card_type || req.query.card_issuer || "Unknown";

//   console.log("Received Tran ID:", tran_id);

//   try {
//     const tempRes = await pool.query(
//       `SELECT * FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
//       [tran_id]
//     );

//     if (tempRes.rowCount === 0) {
//       return res.status(404).json({ message: "Temp order not found" });
//     }

//     const tempOrder = tempRes.rows[0];

//     // 🛠️ Create a mock request and response to reuse addOrderItems()
//     const fakeReq = {
//       body: {
//         cartItems: tempOrder.cart_items,
//         shippingAddress: tempOrder.shipping_address,
//         paymentMethod: card_type,
//         couponName: tempOrder.coupon_name,
//         totalPrice: tempOrder.total_price,
//         tran_id: tran_id,
//       },
//       user: { id: tempOrder.user_id },
//     };

//     // ✅ FIXED FAKE RESPONSE OBJECT
//     const fakeRes = {
//       data: null,
//       status: function (statusCode) {
//         this._status = statusCode;
//         return this;
//       },
//       json: function (data) {
//         this.data = data;
//         return this;
//       },
//     };

//     // ✅ Call actual order creation logic
//     await addOrderItems(fakeReq, fakeRes);
//     const cart_id = fakeRes?.data?.id;

//     console.log("Created cart ID:", cart_id);

//     // ✅ Save payment log
//     await pool.query(
//       `INSERT INTO "BOIPOTRO"."payment_logs" (
//          tran_id, user_id, amount, card_type, cart_id
//        ) VALUES ($1, $2, $3, $4, $5)`,
//       [tran_id, tempOrder.user_id, tempOrder.total_price, card_type, cart_id]
//     );

//     // ✅ Clean up temporary order
//     await pool.query(
//       `DELETE FROM "BOIPOTRO"."temp_orders" WHERE tran_id = $1`,
//       [tran_id]
//     );

//     // Redirect to frontend with success
//     return res.redirect(`http://localhost:5173/order/${cart_id}`);
//   } catch (err) {
//     console.error("⚠️ Failed to finalize payment:", err);
//     if (!res.headersSent) {
//       return res.redirect(`http://localhost:5173/placeorder`);
//     }
//   }
// };

// export const paymentSuccess = async (req, res) => {
//   const orderId = req.params.orderId;
//   console.log("✅ Payment Success Hit:", {
//     params: req.params,
//     query: req.query,
//     body: req.body,
//   });
//   // Mark order as paid
//   res.redirect(`http://localhost:5173/order/${orderId}`);
// };

export const paymentFail = (req, res) => {
  res.redirect(`http://localhost:5173/placeorder`);
};

export const paymentCancel = (req, res) => {
  res.redirect(`http://localhost:5173/placeorder`);
};
