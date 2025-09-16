-- Complete media table setup with all required columns
-- Run this in Supabase SQL Editor if the table needs to be recreated

-- Drop and recreate the media table with all required columns
DROP TABLE IF EXISTS media_rugby12345;

CREATE TABLE media_rugby12345 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    videoType TEXT DEFAULT 'youtube',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE media_rugby12345 ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON media_rugby12345 
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON media_rugby12345 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON media_rugby12345 
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON media_rugby12345 
FOR DELETE USING (true);

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

-- Add some sample media (optional)
INSERT INTO media_rugby12345 (type, url, title, description, date, tags, videoType) VALUES
(
    'image',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
    'Team Training Session',
    'The squad working hard during a training session preparing for the upcoming match.',
    '2024-01-15',
    ARRAY['training', 'preparation'],
    NULL
),
(
    'video',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'Match Highlights',
    'Key moments from our recent victory against Campbell College.',
    '2024-01-10',
    ARRAY['match', 'highlights', 'victory'],
    'youtube'
) ON CONFLICT (id) DO NOTHING;