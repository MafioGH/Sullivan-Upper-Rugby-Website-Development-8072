-- Run this SQL in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

-- Create coaches table for coaching staff
CREATE TABLE IF NOT EXISTS coaches_rugby12345 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    qualifications TEXT,
    experience TEXT,
    phone TEXT,
    email TEXT,
    photo TEXT,
    bio TEXT,
    headCoach BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE coaches_rugby12345 ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON coaches_rugby12345
    FOR SELECT USING (true);

-- Create policies for insert/update/delete
CREATE POLICY "Enable insert for all users" ON coaches_rugby12345
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON coaches_rugby12345
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON coaches_rugby12345
    FOR DELETE USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_coaches_rugby12345_updated_at 
    BEFORE UPDATE ON coaches_rugby12345 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample coaching staff (optional - you can skip this if you prefer to add manually)
INSERT INTO coaches_rugby12345 (name, role, qualifications, experience, photo, bio, headCoach) VALUES 
(
    'Mr. Johnson', 
    'Head Coach', 
    'Level 3 Coaching, First Aid Certified, Safeguarding Qualified', 
    '15 years coaching experience, Former Ulster Academy player', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', 
    'Passionate about developing young rugby talent. Focuses on building character, teamwork, and technical skills. Former Ulster Academy player with extensive coaching experience at youth level.',
    true
),
(
    'Mr. Thompson', 
    'Assistant Coach', 
    'Level 2 Coaching, First Aid Certified', 
    '8 years coaching experience, Former club player', 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', 
    'Specializes in forwards play and lineout coaching. Dedicated to helping each player reach their potential both on and off the field.',
    false
),
(
    'Ms. Wilson', 
    'Team Manager', 
    'Sports Management Diploma, First Aid Certified', 
    '5 years in rugby administration', 
    'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400&h=400&fit=crop&crop=face', 
    'Ensures smooth team operations and player welfare. Coordinates fixtures, travel, and maintains communication between players, parents, and coaching staff.',
    false
)
ON CONFLICT (id) DO NOTHING;