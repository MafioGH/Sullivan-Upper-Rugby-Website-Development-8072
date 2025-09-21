-- URGENT FIX: Add missing thumbnail column to media table
-- Run this SQL in your Supabase SQL Editor immediately:
-- https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Add the missing thumbnail column
ALTER TABLE media_rugby12345 ADD COLUMN IF NOT EXISTS thumbnail TEXT DEFAULT '';

-- Add a comment to document the column
COMMENT ON COLUMN media_rugby12345.thumbnail IS 'URL to video thumbnail image. For videos only - leave empty for images.';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'media_rugby12345' 
ORDER BY ordinal_position;

-- Test that the table now works with thumbnail data
INSERT INTO media_rugby12345 (type, url, title, description, date, tags, videotype, thumbnail)
VALUES (
    'video',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'Test Video with Thumbnail - DELETE ME',
    'Testing thumbnail column functionality',
    CURRENT_DATE,
    ARRAY['test', 'thumbnail'],
    'youtube',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
);

-- Show the test record to confirm it worked
SELECT id, type, title, thumbnail, videotype, created_at 
FROM media_rugby12345 
WHERE title LIKE '%Test Video with Thumbnail%';

-- Clean up test data (run this after confirming it works)
-- DELETE FROM media_rugby12345 WHERE title LIKE '%Test Video with Thumbnail%';