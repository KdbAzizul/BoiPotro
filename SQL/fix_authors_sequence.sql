-- Fix authors table sequence if it's out of sync
-- This script resets the sequence to the maximum ID + 1

-- First, check the current sequence value
SELECT currval('"BOIPOTRO"."authors_id_seq"') as current_sequence_value;

-- Get the maximum ID from the authors table
SELECT MAX(id) as max_id FROM "BOIPOTRO"."authors";

-- Reset the sequence to the maximum ID + 1
SELECT setval('"BOIPOTRO"."authors_id_seq"', (SELECT COALESCE(MAX(id), 0) + 1 FROM "BOIPOTRO"."authors"), false);

-- Verify the sequence is now correct
SELECT currval('"BOIPOTRO"."authors_id_seq"') as new_sequence_value; 