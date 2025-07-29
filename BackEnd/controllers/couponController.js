// Assign coupon to users
import asyncHandler from "../middleware/asyncHandler.js";
import pool from "../db.js";

// @desc    Assign coupon to users
// @route   POST /api/coupons/assign
// @access  Private/Admin
export const assignCouponToUsers = asyncHandler(async (req, res) => {
    const { coupon_id, user_ids } = req.body;
    if (!coupon_id || !user_ids || !Array.isArray(user_ids)) {
      return res.status(400).json({ error: "Coupon ID and array of user IDs are required" });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verify coupon exists and is valid
      const couponCheck = await client.query(
        `SELECT id, valid_until FROM "BOIPOTRO"."coupons" WHERE id = $1`,
        [coupon_id]
      );

      if (couponCheck.rows.length === 0) {
        throw new Error('Coupon not found');
      }

      if (new Date(couponCheck.rows[0].valid_until) < new Date()) {
        throw new Error('Cannot assign expired coupon');
      }

      // Verify all users exist
      const userCheck = await client.query(
        `SELECT id FROM "BOIPOTRO"."users" WHERE id = ANY($1)`,
        [user_ids]
      );

      if (userCheck.rows.length !== user_ids.length) {
        throw new Error('One or more users not found');
      }

      // Insert assignments in bulk
      await client.query(
        `INSERT INTO "BOIPOTRO"."user_coupons" (user_id, coupon_id, used_count)
         SELECT u.id, $1, 0
         FROM unnest($2::integer[]) AS u(id)
         ON CONFLICT (user_id, coupon_id) DO NOTHING`,
        [coupon_id, user_ids]
      );

      await client.query('COMMIT');
      res.json({ 
        message: "Coupon assigned successfully",
        assigned_count: userCheck.rows.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error assigning coupon:', error);
      res.status(400).json({
        message: error.message || 'Failed to assign coupon',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } finally {
      client.release();
    }
  });
  
  // Get coupons for logged-in user
  // @desc    Get coupons for logged-in user
// @route   GET /api/coupons/mine
// @access  Private
export const getMyCoupons = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current timestamp for valid/expired check
      const now = new Date();

      const result = await client.query(
        `SELECT c.*,
                uc.used_count,
                CASE 
                  WHEN c.valid_until < $2 THEN true 
                  ELSE false 
                END as is_expired,
                CASE 
                  WHEN c.valid_from > $2 THEN true 
                  ELSE false 
                END as not_yet_valid,
                CASE 
                  WHEN c.usage_limit IS NOT NULL AND uc.used_count >= c.usage_limit THEN true 
                  ELSE false 
                END as limit_reached
         FROM "BOIPOTRO"."user_coupons" uc
         JOIN "BOIPOTRO"."coupons" c ON uc.coupon_id = c.id
         WHERE uc.user_id = $1
         ORDER BY c.valid_until ASC`,
        [user_id, now]
      );

      await client.query('COMMIT');
      res.json({
        coupons: result.rows,
        active_count: result.rows.filter(c => 
          !c.is_expired && !c.not_yet_valid && !c.limit_reached
        ).length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error fetching coupons:', error);
      res.status(500).json({
        message: 'Failed to fetch coupons',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } finally {
      client.release();
    }
  });

// @desc    Assign coupon to users by level
// @route   POST /api/coupons/assign-by-level
// @access  Private/Admin
export const assignCouponByLevel = asyncHandler(async (req, res) => {
  const { coupon_id, level_id } = req.body;
  
  if (!coupon_id || !level_id) {
    return res.status(400).json({ 
      error: "Coupon ID and level ID are required" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verify coupon exists and is valid
    const couponCheck = await client.query(
      `SELECT id, valid_until FROM "BOIPOTRO"."coupons" WHERE id = $1`,
      [coupon_id]
    );

    if (couponCheck.rows.length === 0) {
      throw new Error('Coupon not found');
    }

    if (new Date(couponCheck.rows[0].valid_until) < new Date()) {
      throw new Error('Cannot assign expired coupon');
    }

    // Verify level exists
    const levelCheck = await client.query(
      `SELECT level_id, level_name FROM "BOIPOTRO"."user_levels" WHERE level_id = $1`,
      [level_id]
    );

    if (levelCheck.rows.length === 0) {
      throw new Error('User level not found');
    }

    // Get all users with this level
    const usersResult = await client.query(
      `SELECT id FROM "BOIPOTRO"."users" WHERE level_id = $1`,
      [level_id]
    );

    if (usersResult.rows.length === 0) {
      throw new Error('No users found with this level');
    }

    const userIds = usersResult.rows.map(user => user.id);

    // Insert assignments in bulk
    await client.query(
      `INSERT INTO "BOIPOTRO"."user_coupons" (user_id, coupon_id, used_count)
       SELECT u.id, $1, 0
       FROM unnest($2::integer[]) AS u(id)
       ON CONFLICT (user_id, coupon_id) DO NOTHING`,
      [coupon_id, userIds]
    );

    await client.query('COMMIT');
    res.json({ 
      message: `Coupon assigned successfully to ${usersResult.rows.length} users with level: ${levelCheck.rows[0].level_name}`,
      assigned_count: usersResult.rows.length,
      level_name: levelCheck.rows[0].level_name
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning coupon by level:', error);
    res.status(400).json({
      message: error.message || 'Failed to assign coupon by level',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// Create a new coupon
// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
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

  // Input validation
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  if (!percentage_discount && !amount_discount) {
    return res.status(400).json({ error: "Either percentage or amount discount must be specified" });
  }

  if (!valid_from || !valid_until) {
    return res.status(400).json({ error: "Valid from and valid until dates are required" });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if coupon code already exists
    const existingCoupon = await client.query(
      `SELECT code FROM "BOIPOTRO"."coupons" WHERE code = $1`,
      [code]
    );

    if (existingCoupon.rows.length > 0) {
      throw new Error('Coupon code already exists');
    }

    // Validate dates
    const fromDate = new Date(valid_from);
    const untilDate = new Date(valid_until);
    const now = new Date();

    if (fromDate > untilDate) {
      throw new Error('Valid from date must be before valid until date');
    }

    // Create coupon
    const result = await client.query(
      `INSERT INTO "BOIPOTRO"."coupons"
        (code, description, percentage_discount, amount_discount, 
         maximum_discount, min_order_amount, valid_from, valid_until, usage_limit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        code,
        description,
        percentage_discount || 0,
        amount_discount || 0,
        maximum_discount,
        min_order_amount || 0,
        valid_from,
        valid_until,
        usage_limit,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Coupon created successfully',
      coupon: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating coupon:', error);
    res.status(400).json({
      message: error.message || 'Failed to create coupon',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// Get all coupons (admin)
// @desc    Get all coupons with usage stats
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const now = new Date();

    const result = await client.query(
      `SELECT c.*,
              COUNT(DISTINCT uc.user_id) as assigned_users,
              COALESCE(SUM(uc.used_count), 0) as total_uses,
              CASE 
                WHEN c.valid_until < $1 THEN true 
                ELSE false 
              END as is_expired,
              CASE 
                WHEN c.valid_from > $1 THEN true 
                ELSE false 
              END as not_yet_valid
       FROM "BOIPOTRO"."coupons" c
       LEFT JOIN "BOIPOTRO"."user_coupons" uc ON c.id = uc.coupon_id
       GROUP BY c.id
       ORDER BY c.valid_until DESC`,
      [now]
    );

    await client.query('COMMIT');
    res.json({
      coupons: result.rows,
      active_count: result.rows.filter(c => !c.is_expired && !c.not_yet_valid).length,
      expired_count: result.rows.filter(c => c.is_expired).length,
      future_count: result.rows.filter(c => c.not_yet_valid).length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      message: 'Failed to fetch coupons',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// @desc    Delete a coupon and its assignments
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if coupon exists
    const couponExists = await client.query(
      `SELECT id, code FROM "BOIPOTRO"."coupons" WHERE id = $1`,
      [id]
    );

    if (couponExists.rows.length === 0) {
      throw new Error('Coupon not found');
    }

    // Check if coupon is in use in any orders
    const orderCheck = await client.query(
      `SELECT COUNT(*) as order_count 
       FROM "BOIPOTRO"."cart" 
       WHERE coupon_id = $1`,
      [id]
    );

    if (parseInt(orderCheck.rows[0].order_count) > 0) {
      throw new Error('Cannot delete coupon that has been used in orders');
    }

    // Delete coupon assignments
    await client.query(
      `DELETE FROM "BOIPOTRO"."user_coupons" WHERE coupon_id = $1`,
      [id]
    );

    // Delete coupon
    const result = await client.query(
      `DELETE FROM "BOIPOTRO"."coupons" WHERE id = $1 RETURNING code`,
      [id]
    );

    await client.query('COMMIT');
    res.json({ 
      message: `Coupon ${result.rows[0].code} deleted successfully`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting coupon:', error);
    res.status(
      error.message === 'Coupon not found' ? 404 :
      error.message.includes('used in orders') ? 400 : 500
    ).json({
      message: error.message || 'Failed to delete coupon',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});