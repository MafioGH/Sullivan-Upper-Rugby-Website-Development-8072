-- Run this SQL in your Supabase SQL Editor to add the missing videoType column
-- Go to: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Add the videoType column to the media table
ALTER TABLE media_rugby12345 
ADD COLUMN IF NOT EXISTS videoType TEXT DEFAULT 'youtube';

-- Update any existing video records to have a default videoType
UPDATE media_rugby12345 
SET videoType = 'youtube' 
WHERE type = 'video' AND (videoType IS NULL OR videoType = '');

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'media_rugby12345' 
ORDER BY ordinal_position;