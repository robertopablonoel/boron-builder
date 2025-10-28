-- Fix RLS policies properly - no more recursion!
-- The key: don't query store_members within store_members policies

-- Drop all existing policies on store_members
DROP POLICY IF EXISTS "Users can create their own membership" ON store_members;
DROP POLICY IF EXISTS "Users can view store memberships" ON store_members;
DROP POLICY IF EXISTS "Store owners and admins can manage members" ON store_members;

-- Simple, non-recursive policies:

-- 1. Users can see their own membership records
CREATE POLICY "Users can view own memberships"
  ON store_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can insert their own membership (for accepting invites)
CREATE POLICY "Users can create own membership"
  ON store_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. For viewing OTHER members in a store, we need a smarter approach
-- Use a security definer function that bypasses RLS internally
CREATE OR REPLACE FUNCTION user_is_store_admin(store_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM store_members
    WHERE store_id = store_id_param
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$;

-- 4. Admins and owners can update/delete members
CREATE POLICY "Store admins can manage members"
  ON store_members
  FOR ALL
  TO authenticated
  USING (user_is_store_admin(store_id))
  WITH CHECK (user_is_store_admin(store_id));
