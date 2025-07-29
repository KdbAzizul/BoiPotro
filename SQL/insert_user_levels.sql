-- Insert sample user levels for coupon assignment testing
-- This script creates different user levels based on order count

INSERT INTO "BOIPOTRO"."user_levels" (level_name, min_orders, max_orders) VALUES
('Bronze', 0, 4),
('Silver', 5, 9),
('Gold', 10, 19),
('Platinum', 20, 49),
('Diamond', 50, NULL)
ON CONFLICT DO NOTHING;

-- Update existing users to have appropriate levels based on their order_count
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