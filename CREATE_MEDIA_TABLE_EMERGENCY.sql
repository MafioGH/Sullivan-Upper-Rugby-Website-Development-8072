-- EMERGENCY: Run this SQL in your Supabase SQL Editor immediately
-- Go to: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Drop table if it exists (to start fresh)
DROP TABLE IF EXISTS media_rugby12345;

-- Create the media table with all required columns
CREATE TABLE media_rugby12345 (
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

-- Enable Row Level Security
ALTER TABLE media_rugby12345 ENABLE ROW LEVEL SECURITY;

-- Create policies for full access (emergency fix)
CREATE POLICY "Emergency: Enable all operations for everyone" 
  ON media_rugby12345 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_rugby12345_updated_at
  BEFORE UPDATE ON media_rugby12345
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Test insert to verify everything works
INSERT INTO media_rugby12345 (type, url, title, description, date, tags, videoType)
VALUES (
  'video',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Emergency Test Video - You can delete this',
  'This confirms the database is working',
  CURRENT_DATE,
  ARRAY['test', 'emergency'],
  'youtube'
);

-- Show the result
SELECT 'SUCCESS: Table created and test data inserted' as status;
SELECT * FROM media_rugby12345 WHERE title LIKE '%Emergency Test%';