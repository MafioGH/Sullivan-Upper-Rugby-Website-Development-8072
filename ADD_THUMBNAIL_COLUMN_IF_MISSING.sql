-- URGENT: Run this SQL in your Supabase SQL Editor to ensure thumbnail column exists
-- Go to: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Add thumbnail column if it doesn't exist (safe to run multiple times)
ALTER TABLE media_rugby12345 
ADD COLUMN IF NOT EXISTS thumbnail TEXT DEFAULT '';

-- Add a comment to document the column
COMMENT ON COLUMN media_rugby12345.thumbnail IS 'URL to video thumbnail image. Enhanced support for Google Drive videos.';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'media_rugby12345' 
ORDER BY ordinal_position;

-- Show current media count and Google Drive videos
SELECT 
  COUNT(*) as total_media,
  COUNT(CASE WHEN type = 'video' AND (videotype = 'googledrive' OR url LIKE '%drive.google.com%') THEN 1 END) as google_drive_videos,
  COUNT(CASE WHEN type = 'video' AND (videotype = 'googledrive' OR url LIKE '%drive.google.com%') AND (thumbnail IS NULL OR thumbnail = '') THEN 1 END) as google_drive_without_thumbnails
FROM media_rugby12345;

-- Optional: Test Google Drive thumbnail generation with sample data
-- (This inserts a test record to verify everything works - you can delete it after testing)
INSERT INTO media_rugby12345 (type, url, title, description, date, tags, videotype, thumbnail)
VALUES (
  'video',
  'https://drive.google.com/file/d/1ABC123DEF456/preview',
  'Test Google Drive Video - DELETE ME',
  'Testing enhanced Google Drive thumbnail functionality',
  CURRENT_DATE,
  ARRAY['test', 'google-drive', 'thumbnail'],
  'googledrive',
  'https://drive.google.com/thumbnail?id=1ABC123DEF456&sz=w480-h270'
)
ON CONFLICT (id) DO NOTHING;

-- Clean up test data (run this after confirming the feature works)
-- DELETE FROM media_rugby12345 WHERE title LIKE '%Test Google Drive Video%';