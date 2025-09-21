-- Run this SQL in your Supabase SQL Editor to add thumbnail support
-- Go to: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Add thumbnail column to the media table
ALTER TABLE media_rugby12345 ADD COLUMN IF NOT EXISTS thumbnail TEXT DEFAULT '';

-- Add a comment to document the column
COMMENT ON COLUMN media_rugby12345.thumbnail IS 'URL to video thumbnail image. For videos only - leave empty for images.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'media_rugby12345' 
ORDER BY ordinal_position;

-- Optional: Update existing videos with auto-generated thumbnails
-- YouTube videos can use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
-- This will be handled by the frontend, but you can manually set some if needed