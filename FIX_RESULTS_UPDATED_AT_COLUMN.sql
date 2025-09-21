-- URGENT FIX: Add missing updated_at column to results table
-- Run this SQL in your Supabase SQL Editor immediately:
-- https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Add the missing updated_at column to results table
ALTER TABLE results_rugby12345 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at on results table
DROP TRIGGER IF EXISTS update_results_rugby12345_updated_at ON results_rugby12345;
CREATE TRIGGER update_results_rugby12345_updated_at 
    BEFORE UPDATE ON results_rugby12345 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'results_rugby12345' 
ORDER BY ordinal_position;

-- Test that updates now work without errors
SELECT 'SUCCESS: updated_at column added to results_rugby12345 table' as status;