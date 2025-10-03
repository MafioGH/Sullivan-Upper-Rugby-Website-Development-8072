-- CRITICAL: Add cancellation columns to fixtures table FIRST
-- Run this SQL in your Supabase SQL Editor BEFORE using the updated code:
-- https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Add the cancellation columns to fixtures table
ALTER TABLE fixtures_rugby12345 
ADD COLUMN IF NOT EXISTS cancelled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT DEFAULT '';

-- Add comments to document the columns
COMMENT ON COLUMN fixtures_rugby12345.cancelled IS 'Whether the match has been cancelled or postponed';
COMMENT ON COLUMN fixtures_rugby12345.cancellation_reason IS 'Optional reason for cancellation (e.g., "Wet weather", "Unplayable pitch")';

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'fixtures_rugby12345' 
ORDER BY ordinal_position;

-- Test that the columns work with sample data
UPDATE fixtures_rugby12345 
SET cancelled = true, cancellation_reason = 'Test cancellation - Remove This' 
WHERE id = (SELECT id FROM fixtures_rugby12345 LIMIT 1);

-- Show the test result
SELECT id, opponent, cancelled, cancellation_reason 
FROM fixtures_rugby12345 
WHERE cancelled = true;

-- Clean up test data (optional - you can run this after confirming it works)
-- UPDATE fixtures_rugby12345 SET cancelled = false, cancellation_reason = '' WHERE cancellation_reason = 'Test cancellation - Remove This';

SELECT 'SUCCESS: cancellation columns added to fixtures_rugby12345 table' as status;