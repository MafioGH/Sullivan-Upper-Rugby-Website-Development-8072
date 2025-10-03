-- CRITICAL: Add player_of_match column to results table FIRST
-- Run this SQL in your Supabase SQL Editor BEFORE using the updated code:
-- https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Add the player_of_match column to results table
ALTER TABLE results_rugby12345 
ADD COLUMN IF NOT EXISTS player_of_match TEXT DEFAULT '';

-- Add a comment to document the column
COMMENT ON COLUMN results_rugby12345.player_of_match IS 'Name of the player who was awarded Player of the Match. Optional field.';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'results_rugby12345' 
ORDER BY ordinal_position;

-- Test that the column works with sample data
UPDATE results_rugby12345 
SET player_of_match = 'Test Player - Remove This' 
WHERE id = (SELECT id FROM results_rugby12345 LIMIT 1);

-- Show the test result
SELECT id, opponent, player_of_match 
FROM results_rugby12345 
WHERE player_of_match IS NOT NULL AND player_of_match != '';

-- Clean up test data (optional - you can run this after confirming it works)
-- UPDATE results_rugby12345 SET player_of_match = '' WHERE player_of_match = 'Test Player - Remove This';

SELECT 'SUCCESS: player_of_match column added to results_rugby12345 table' as status;