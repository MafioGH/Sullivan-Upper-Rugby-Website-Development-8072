-- Run this SQL in your Supabase SQL Editor to fix the age column constraint
-- Go to: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Remove the NOT NULL constraint from the age column
ALTER TABLE players_rugby12345 ALTER COLUMN age DROP NOT NULL;

-- Verify the change worked
\d players_rugby12345;

-- Optional: Update any existing records that might have invalid age values
-- (This shouldn't be necessary, but just in case)
UPDATE players_rugby12345 SET age = NULL WHERE age = 0 OR age < 13 OR age > 18;

-- Test that NULL values are now allowed
-- This should work without errors:
-- INSERT INTO players_rugby12345 (name, position, age) VALUES ('Test Player', 'Prop', NULL);
-- DELETE FROM players_rugby12345 WHERE name = 'Test Player';