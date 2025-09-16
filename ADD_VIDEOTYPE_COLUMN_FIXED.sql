-- COMPREHENSIVE FIX for media table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- First, add the videoType column if it doesn't exist
ALTER TABLE media_rugby12345 
ADD COLUMN IF NOT EXISTS videoType TEXT DEFAULT 'youtube';

-- Update any existing video records to have a default videoType
UPDATE media_rugby12345 
SET videoType = 'youtube' 
WHERE type = 'video' AND (videoType IS NULL OR videoType = '');

-- Make sure all required columns exist
ALTER TABLE media_rugby12345 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'media_rugby12345' 
ORDER BY ordinal_position;

-- Test insert (you can remove this after confirming it works)
INSERT INTO media_rugby12345 (type, url, title, description, date, tags, videoType) VALUES
(
    'video',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'Test Video Upload',
    'Testing video upload functionality',
    CURRENT_DATE,
    ARRAY['test', 'upload'],
    'youtube'
) ON CONFLICT (id) DO NOTHING;

-- Clean up test data (run this after confirming upload works)
-- DELETE FROM media_rugby12345 WHERE title = 'Test Video Upload';