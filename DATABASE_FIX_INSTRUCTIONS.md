# Fix Age Column Database Constraint

## The Problem
The database table still has a NOT NULL constraint on the "age" column, but your frontend now allows optional age values (sends NULL when empty).

## The Solution
You need to run a SQL command in your Supabase dashboard to remove the NOT NULL constraint.

## Step-by-Step Instructions:

### 1. Go to Supabase SQL Editor
Open this link in a new tab:
https://supabase.com/dashboard/project/pjtgsnbtghxahwtcgxdw/sql/new

### 2. Copy and Paste This SQL Command:
```sql
-- Remove the NOT NULL constraint from the age column
ALTER TABLE players_rugby12345 ALTER COLUMN age DROP NOT NULL;
```

### 3. Click "RUN" 
Click the RUN button to execute the SQL command.

### 4. Verify Success
You should see a success message. The age column will now accept NULL values.

## What This Does:
- ✅ Allows players to be added without specifying age
- ✅ Existing players with age keep their values  
- ✅ New players can have age left empty (stored as NULL)
- ✅ Your frontend form will work as expected

## Alternative Quick Test:
After running the SQL, try adding a player without an age value - it should work perfectly!

## If You Can't Access SQL Editor:
If you have trouble accessing the Supabase SQL editor, let me know and I can provide an alternative solution.