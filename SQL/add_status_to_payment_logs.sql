-- Add status column to payment_logs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'BOIPOTRO'
        AND table_name = 'payment_logs'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE "BOIPOTRO"."payment_logs"
        ADD COLUMN status VARCHAR(50);
    END IF;
END
$$;
