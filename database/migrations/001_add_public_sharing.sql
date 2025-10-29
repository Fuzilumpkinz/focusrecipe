-- Migration: Add public sharing functionality to recipes table
-- This adds an is_public boolean field to control recipe visibility

-- Add the is_public column to the recipes table
ALTER TABLE recipes 
ADD COLUMN is_public BOOLEAN DEFAULT FALSE NOT NULL;

-- Create an index on is_public for faster queries
CREATE INDEX idx_recipes_is_public ON recipes(is_public);

-- Add comment to explain the purpose
COMMENT ON COLUMN recipes.is_public IS 'Controls whether the recipe is publicly visible to anyone with the link';

-- Update RLS policies to allow public access to public recipes
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;

-- Create new RLS policies
CREATE POLICY "Users can view their own recipes" ON recipes
    FOR SELECT USING (
        auth.uid() = created_by_profile_id 
        OR is_public = true
    );

CREATE POLICY "Users can insert their own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = created_by_profile_id);

CREATE POLICY "Users can update their own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = created_by_profile_id)
    WITH CHECK (auth.uid() = created_by_profile_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
    FOR DELETE USING (auth.uid() = created_by_profile_id);
