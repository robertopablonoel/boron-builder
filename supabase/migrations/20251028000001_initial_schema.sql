-- ============================================
-- BORON BUILDER: MULTI-TENANT DATABASE SCHEMA
-- Task 01: Database Schema Setup (Fixed Order)
-- ============================================

-- ============================================
-- STEP 1: HELPER FUNCTIONS
-- ============================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: CREATE ALL TABLES (No RLS policies yet)
-- ============================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profile data (no Shopify connection here - moved to stores)';
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  shopify_connected boolean DEFAULT false,
  shopify_store_domain text,
  shopify_access_token text,
  plan text DEFAULT 'free',
  seat_limit integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE stores IS 'Organizations/stores - each has one Shopify connection';
CREATE INDEX IF NOT EXISTS stores_slug_idx ON stores(slug);
CREATE INDEX IF NOT EXISTS stores_shopify_domain_idx ON stores(shopify_store_domain);

-- STORE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS store_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(store_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member'))
);

COMMENT ON TABLE store_members IS 'Junction table: users ↔ stores with roles';
CREATE INDEX IF NOT EXISTS store_members_store_id_idx ON store_members(store_id);
CREATE INDEX IF NOT EXISTS store_members_user_id_idx ON store_members(user_id);
CREATE INDEX IF NOT EXISTS store_members_role_idx ON store_members(role);

-- STORE INVITES TABLE
CREATE TABLE IF NOT EXISTS store_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  status text DEFAULT 'pending',
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_invite_role CHECK (role IN ('admin', 'member')),
  CONSTRAINT valid_invite_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  UNIQUE(store_id, email, status)
);

COMMENT ON TABLE store_invites IS 'Pending invitations to join stores';
CREATE INDEX IF NOT EXISTS store_invites_store_id_idx ON store_invites(store_id);
CREATE INDEX IF NOT EXISTS store_invites_email_idx ON store_invites(email);
CREATE INDEX IF NOT EXISTS store_invites_token_idx ON store_invites(token);
CREATE INDEX IF NOT EXISTS store_invites_status_idx ON store_invites(status);

-- FUNNELS TABLE
CREATE TABLE IF NOT EXISTS funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  status text DEFAULT 'draft',
  funnel_data jsonb NOT NULL,
  shopify_product_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  views integer DEFAULT 0,
  conversions integer DEFAULT 0,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

COMMENT ON TABLE funnels IS 'Store funnels - shared by all store members';
CREATE INDEX IF NOT EXISTS funnels_store_id_idx ON funnels(store_id);
CREATE INDEX IF NOT EXISTS funnels_created_by_idx ON funnels(created_by);
CREATE INDEX IF NOT EXISTS funnels_status_idx ON funnels(status);
CREATE INDEX IF NOT EXISTS funnels_shopify_product_id_idx ON funnels(shopify_product_id);
CREATE INDEX IF NOT EXISTS funnels_created_at_idx ON funnels(created_at DESC);

-- SHOPIFY PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS shopify_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_product_id text NOT NULL,
  title text NOT NULL,
  description text,
  price numeric(10, 2),
  compare_at_price numeric(10, 2),
  currency text DEFAULT 'USD',
  images jsonb,
  featured_image text,
  variants jsonb,
  tags text[],
  vendor text,
  product_type text,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, shopify_product_id)
);

COMMENT ON TABLE shopify_products IS 'Cached Shopify product data per store';
CREATE INDEX IF NOT EXISTS shopify_products_store_id_idx ON shopify_products(store_id);
CREATE INDEX IF NOT EXISTS shopify_products_shopify_id_idx ON shopify_products(shopify_product_id);
CREATE INDEX IF NOT EXISTS shopify_products_last_synced_idx ON shopify_products(last_synced_at);

-- SYNC JOBS TABLE
CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  triggered_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  type text NOT NULL,
  products_synced integer DEFAULT 0,
  errors jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_sync_status CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  CONSTRAINT valid_sync_type CHECK (type IN ('shopify_products', 'shopify_orders'))
);

COMMENT ON TABLE sync_jobs IS 'Tracking Shopify sync operations per store';
CREATE INDEX IF NOT EXISTS sync_jobs_store_id_idx ON sync_jobs(store_id);
CREATE INDEX IF NOT EXISTS sync_jobs_status_idx ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS sync_jobs_created_at_idx ON sync_jobs(created_at DESC);

-- ============================================
-- STEP 3: CREATE TRIGGERS (Non-RLS)
-- ============================================

-- Profile updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Stores updated_at trigger
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funnels updated_at trigger
CREATE TRIGGER update_funnels_updated_at
  BEFORE UPDATE ON funnels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure store has owner
CREATE OR REPLACE FUNCTION ensure_store_has_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'owner' THEN
    IF (SELECT COUNT(*) FROM store_members
        WHERE store_id = OLD.store_id AND role = 'owner') <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last owner from a store';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_last_owner_removal
  BEFORE DELETE ON store_members
  FOR EACH ROW
  EXECUTE FUNCTION ensure_store_has_owner();

-- Expire old invites function
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
  UPDATE store_invites
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE ALL RLS POLICIES
-- ============================================

-- PROFILES RLS POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- STORES RLS POLICIES
CREATE POLICY "Users can view stores they belong to"
  ON stores FOR SELECT
  USING (
    id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their store"
  ON stores FOR UPDATE
  USING (
    id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- STORE MEMBERS RLS POLICIES
CREATE POLICY "Users can view memberships of their stores"
  ON store_members FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can manage members"
  ON store_members FOR ALL
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- STORE INVITES RLS POLICIES
CREATE POLICY "Store members can view invites for their stores"
  ON store_invites FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners/admins can create invites"
  ON store_invites FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Store owners/admins can cancel invites"
  ON store_invites FOR UPDATE
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone can view invite by token"
  ON store_invites FOR SELECT
  USING (true);

-- FUNNELS RLS POLICIES
CREATE POLICY "Users can view funnels from their stores"
  ON funnels FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert funnels to their stores"
  ON funnels FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store members can update funnels"
  ON funnels FOR UPDATE
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners/admins can delete funnels"
  ON funnels FOR DELETE
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone can view published funnels"
  ON funnels FOR SELECT
  USING (status = 'published');

-- SHOPIFY PRODUCTS RLS POLICIES
CREATE POLICY "Users can view products from their stores"
  ON shopify_products FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store members can manage products"
  ON shopify_products FOR ALL
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

-- SYNC JOBS RLS POLICIES
CREATE POLICY "Users can view sync jobs from their stores"
  ON sync_jobs FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store members can create sync jobs"
  ON sync_jobs FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM store_members
      WHERE user_id = auth.uid()
    )
  );
