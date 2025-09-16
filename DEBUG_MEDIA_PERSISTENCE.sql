-- DEBUG SCRIPT - Run this to diagnose media persistence issues
-- Run in Supabase SQL Editor after adding videos through PhotoManager

-- 1. Check if media table exists and has data
SELECT 
    'Table exists' as status,
    COUNT(*) as total_items,
    COUNT(CASE WHEN type = 'video' THEN 1 END) as video_count,
    COUNT(CASE WHEN type = 'image' THEN 1 END) as image_count
FROM media_rugby12345;

-- 2. Show recent media additions (last 24 hours)
SELECT 
    id,
    type,
    title,
    LEFT(url, 50) || '...' as url_preview,
    videoType,
    date,
    created_at,
    tags
FROM media_rugby12345 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 3. Show all Google Drive videos specifically
SELECT 
    id,
    title,
    url,
    description,
    videoType,
    created_at
FROM media_rugby12345 
WHERE type = 'video' 
AND (url LIKE '%drive.google.com%' OR videoType = 'googledrive')
ORDER BY created_at DESC;

-- 4. Check for any database errors or constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'media_rugby12345';

-- 5. Test insert permissions (this should work)
DO $$
DECLARE 
    test_id UUID;
BEGIN
    INSERT INTO media_rugby12345 (type, url, title, description, date, tags, videoType)
    VALUES (
        'video',
        'https://drive.google.com/file/d/TEST123/preview',
        'Permission Test Video - DELETE ME',
        'Testing database insert permissions',
        CURRENT_DATE,
        ARRAY['test', 'permissions'],
        'googledrive'
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE 'SUCCESS: Test video inserted with ID: %', test_id;
    
    -- Clean up test data
    DELETE FROM media_rugby12345 WHERE id = test_id;
    RAISE NOTICE 'SUCCESS: Test video deleted successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: Failed to insert test video: %', SQLERRM;
END $$;

-- 6. Check real-time subscriptions are enabled
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'media_rugby12345';