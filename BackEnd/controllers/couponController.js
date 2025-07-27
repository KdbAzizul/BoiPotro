// Assign coupon to users
import asyncHandler from "../middleware/asyncHandler.js";
import pool from "../db.js";

export const assignCouponToUsers = asyncHandler(async (req, res) => {
    const { coupon_id, user_ids } = req.body;
    if (!coupon_id || !user_ids || !Array.isArray(user_ids)) {
      return res.status(400).json({ error: "Invalid input" });
    }
  
    for (const user_id of user_ids) {
      // Upsert: if already exists, do nothing
      await pool.query(
        `INSERT INTO "BOIPOTRO"."user_coupons" (user_id, coupon_id, used_count)
         VALUES ($1, $2, 0)
         ON CONFLICT (user_id, coupon_id) DO NOTHING`,
        [user_id, coupon_id]
      );
    }
    res.json({ message: "Coupon assigned to users" });
  });
  
  // Get coupons for logged-in user
  export const getMyCoupons = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const result = await pool.query(
      `SELECT c.*,
              uc.used_count
       FROM "BOIPOTRO"."user_coupons" uc
       JOIN "BOIPOTRO"."coupons" c ON uc.coupon_id = c.id
       WHERE uc.user_id = $1`,
      [user_id]
    );
    res.json(result.rows);
  });

// Create a new coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    percentage_discount,
    amount_discount,
    maximum_discount,
    min_order_amount,
    valid_from,
    valid_until,
    usage_limit,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO "BOIPOTRO"."coupons"
      (code, description, percentage_discount, amount_discount, maximum_discount, min_order_amount, valid_from, valid_until, usage_limit)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      code,
      description,
      percentage_discount,
      amount_discount,
      maximum_discount,
      min_order_amount,
      valid_from,
      valid_until,
      usage_limit,
    ]
  );
  res.status(201).json(result.rows[0]);
});

// Get all coupons (admin)
export const getAllCoupons = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM "BOIPOTRO"."coupons" ORDER BY id DESC');
  res.json(result.rows);
});

// Delete a coupon (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Optionally, you may want to delete from user_coupons first if you have foreign key constraints
  await pool.query('DELETE FROM "BOIPOTRO"."user_coupons" WHERE coupon_id = $1', [id]);
  const result = await pool.query('DELETE FROM "BOIPOTRO"."coupons" WHERE id = $1 RETURNING *', [id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Coupon not found' });
  }
  res.json({ message: 'Coupon deleted successfully' });
});