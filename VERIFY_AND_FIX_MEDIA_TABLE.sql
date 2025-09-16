-- COMPREHENSIVE MEDIA TABLE VERIFICATION AND FIX
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- First, let's check if the media table exists and see its structure
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'media_rugby12345';

-- Check the current structure of the media table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'media_rugby12345' 
ORDER BY ordinal_position;

-- If the table doesn't exist or is missing columns, let's create/fix it
CREATE TABLE IF NOT EXISTS media_rugby12345 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    date DATE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    videoType TEXT DEFAULT 'youtube',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE media_rugby12345 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS videoType TEXT DEFAULT 'youtube';

-- Enable Row Level Security
ALTER TABLE media_rugby12345 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON media_rugby12345;
DROP POLICY IF EXISTS "Enable insert for all users" ON media_rugby12345;
DROP POLICY IF EXISTS "Enable update for all users" ON media_rugby12345;
DROP POLICY IF EXISTS "Enable delete for all users" ON media_rugby12345;

-- Create comprehensive policies for full access
CREATE POLICY "Enable read access for all users" 
ON media_rugby12345 FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON media_rugby12345 FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON media_rugby12345 FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON media_rugby12345 FOR DELETE 
USING (true);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_media_rugby12345_updated_at ON media_rugby12345;
CREATE TRIGGER update_media_rugby12345_updated_at
    BEFORE UPDATE ON media_rugby12345
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Test the table with a sample insert (Google Drive video)
INSERT INTO media_rugby12345 (type, url, title, description, date, tags, videoType)
VALUES (
    'video',
    'https://drive.google.com/file/d/1ABC123DEF456/preview',
    'Test Google Drive Video - DELETE ME',
    'This is a test entry to verify database functionality',
    CURRENT_DATE,
    ARRAY['test', 'database', 'google-drive'],
    'googledrive'
) ON CONFLICT (id) DO NOTHING;

-- Verify the insert worked
SELECT COUNT(*) as total_media_items FROM media_rugby12345;
SELECT * FROM media_rugby12345 WHERE title LIKE '%Test Google Drive Video%';

-- Check if there are any existing media items
SELECT 
    id,
    type,
    title,
    description,
    date,
    tags,
    videoType,
    created_at
FROM media_rugby12345 
ORDER BY created_at DESC 
LIMIT 10;

-- Show table permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'media_rugby12345';

-- Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'media_rugby12345';