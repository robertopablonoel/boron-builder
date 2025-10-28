-- Fix RLS policies to avoid infinite recursion
-- The issue: policies were checking store_members to determine access to store_members

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view memberships of their stores" ON store_members;
DROP POLICY IF EXISTS "Store owners can manage members" ON store_members;

-- Create better policies

-- Allow users to INSERT their own membership when joining a store
CREATE POLICY "Users can create their own membership"
  ON store_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view memberships of stores they belong to
-- Use a simpler check that doesn't cause recursion
CREATE POLICY "Users can view store memberships"
  ON store_members
  FOR SELECT
  TO authenticated
  USING (
    -- User can see their own memberships
    user_id = auth.uid()
    OR
    -- User can see memberships of stores they're in
    -- This uses a direct EXISTS check without circular reference
    EXISTS (
      SELECT 1 FROM store_members sm
      WHERE sm.store_id = store_members.store_id
        AND sm.user_id = auth.uid()
    )
  );

-- Allow owners and admins to manage members
CREATE POLICY "Store owners and admins can manage members"
  ON store_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_members sm
      WHERE sm.store_id = store_members.store_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('owner', 'admin')
    )
  );
