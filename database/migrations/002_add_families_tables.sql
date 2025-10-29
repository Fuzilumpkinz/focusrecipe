-- Migration: Add families tables and functionality
-- This creates the families, family_members, and family_invitations tables
-- Also updates recipes table to support family sharing

-- Create families table
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Meal planning configuration
    plan_config_meals_per_day INTEGER DEFAULT 3,
    plan_config_snacks_per_day INTEGER DEFAULT 2
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(family_id, profile_id)
);

-- Create family_invitations table
CREATE TABLE IF NOT EXISTS family_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invited_email VARCHAR(255) NOT NULL,
    invited_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add family_id column to recipes table for sharing
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES families(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_families_created_by ON families(created_by);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_profile_id ON family_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_invited_email ON family_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_recipes_family_id ON recipes(family_id);

-- Enable RLS (Row Level Security)
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families table
CREATE POLICY "Users can view families they are members of" ON families
    FOR SELECT USING (
        created_by = auth.uid() OR
        id IN (
            SELECT family_id FROM family_members 
            WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can create families" ON families
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family admins can update families" ON families
    FOR UPDATE USING (
        created_by = auth.uid() OR
        id IN (
            SELECT family_id FROM family_members 
            WHERE profile_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Family creators can delete families" ON families
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for family_members table
CREATE POLICY "Users can view family memberships they are part of" ON family_members
    FOR SELECT USING (
        profile_id = auth.uid() OR
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert family memberships for their own profiles" ON family_members
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Family admins can manage family memberships" ON family_members
    FOR UPDATE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE profile_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Family admins can delete family memberships" ON family_members
    FOR DELETE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE profile_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for family_invitations table
CREATE POLICY "Users can view invitations they sent or received" ON family_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR
        invited_email = (
            SELECT email FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Family admins can create invitations" ON family_invitations
    FOR INSERT WITH CHECK (
        invited_by = auth.uid() AND
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE profile_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update invitations they received" ON family_invitations
    FOR UPDATE USING (
        invited_email = (
            SELECT email FROM profiles WHERE id = auth.uid()
        )
    );

-- Update recipes RLS policies to include family access
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;

CREATE POLICY "Users can view their own recipes" ON recipes
    FOR SELECT USING (
        auth.uid() = created_by_profile_id 
        OR is_public = true
        OR family_id IN (
            SELECT family_id FROM family_members 
            WHERE profile_id = auth.uid()
        )
    );

-- Create function to automatically add family creator as admin
CREATE OR REPLACE FUNCTION add_family_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO family_members (family_id, profile_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add creator as admin
CREATE TRIGGER trigger_add_family_creator_as_admin
    AFTER INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION add_family_creator_as_admin();

-- Create function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to generate invitation token
CREATE TRIGGER trigger_generate_invitation_token
    BEFORE INSERT ON family_invitations
    FOR EACH ROW
    WHEN (NEW.invitation_token IS NULL)
    EXECUTE FUNCTION generate_invitation_token();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_family_invitations_updated_at
    BEFORE UPDATE ON family_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE families IS 'Family groups for sharing recipes and meal planning';
COMMENT ON TABLE family_members IS 'Membership table for families with roles';
COMMENT ON TABLE family_invitations IS 'Invitations for users to join families';
COMMENT ON COLUMN recipes.family_id IS 'Optional family ID for sharing recipes with family members';
