-- COPY THIS EXACT COMMAND AND RUN IT IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

ALTER TABLE players_rugby12345 ALTER COLUMN age DROP NOT NULL;

-- That's it! This single line fixes the issue.
-- After running this, your player forms will work with optional age fields.