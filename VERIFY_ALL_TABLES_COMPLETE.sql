-- Comprehensive check of ALL tables to ensure no missing columns
-- Run this after fixing the updated_at issue

-- Check results_rugby12345 structure
SELECT 'results_rugby12345' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'results_rugby12345' 
ORDER BY ordinal_position;

-- Check media_rugby12345 structure  
SELECT 'media_rugby12345' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'media_rugby12345' 
ORDER BY ordinal_position;

-- Check fixtures_rugby12345 structure
SELECT 'fixtures_rugby12345' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'fixtures_rugby12345' 
ORDER BY ordinal_position;

-- Check players_rugby12345 structure
SELECT 'players_rugby12345' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'players_rugby12345' 
ORDER BY ordinal_position;

-- Check coaches_rugby12345 structure
SELECT 'coaches_rugby12345' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'coaches_rugby12345' 
ORDER BY ordinal_position;

-- Verify all tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%rugby12345%'
ORDER BY table_name;