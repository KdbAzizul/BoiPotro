-- Test script for coupon assignment functionality
-- This script sets up sample data for testing

-- 1. Insert user levels
INSERT INTO "BOIPOTRO"."user_levels" (level_name, min_orders, max_orders) VALUES
('Bronze', 0, 4),
('Silver', 5, 9),
('Gold', 10, 19),
('Platinum', 20, 49),
('Diamond', 50, NULL)
ON CONFLICT DO NOTHING;

-- 2. Update users with sample order counts and levels
UPDATE "BOIPOTRO"."users" 
SET order_count = CASE 
  WHEN id % 5 = 0 THEN 2    -- Bronze
  WHEN id % 5 = 1 THEN 7    -- Silver  
  WHEN id % 5 = 2 THEN 15   -- Gold
  WHEN id % 5 = 3 THEN 35   -- Platinum
  WHEN id % 5 = 4 THEN 75   -- Diamond
  ELSE 0
END
WHERE order_count IS NULL OR order_count = 0;

-- 3. Assign levels to users based on order count
UPDATE "BOIPOTRO"."users" 
SET level_id = (
  SELECT level_id 
  FROM "BOIPOTRO"."user_levels" 
  WHERE order_count >= min_orders 
    AND (max_orders IS NULL OR order_count <= max_orders)
  ORDER BY min_orders DESC 
  LIMIT 1
)
WHERE level_id IS NULL;

-- 4. Insert sample coupons
INSERT INTO "BOIPOTRO"."coupons" (code, description, percentage_discount, valid_from, valid_until, usage_limit) VALUES
('BRONZE10', '10% off for Bronze members', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100),
('SILVER15', '15% off for Silver members', 15, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 50),
('GOLD20', '20% off for Gold members', 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 25),
('PLATINUM25', '25% off for Platinum members', 25, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 10),
('DIAMOND30', '30% off for Diamond members', 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 5)
ON CONFLICT DO NOTHING;

-- 5. Show current setup
SELECT 
  'User Levels:' as info,
  level_id,
  level_name,
  min_orders,
  max_orders
FROM "BOIPOTRO"."user_levels"
ORDER BY min_orders;

SELECT 
  'Users with Levels:' as info,
  u.id,
  u.name,
  u.order_count,
  ul.level_name
FROM "BOIPOTRO"."users" u
LEFT JOIN "BOIPOTRO"."user_levels" ul ON u.level_id = ul.level_id
ORDER BY u.id;

SELECT 
  'Available Coupons:' as info,
  id,
  code,
  description,
  percentage_discount
FROM "BOIPOTRO"."coupons"
ORDER BY id; 