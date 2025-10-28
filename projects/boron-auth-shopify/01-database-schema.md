# Task 01: Database Schema Setup (Multi-Tenant)

⏱ **Estimated Time:** 3 hours

## Objectives

- Create `profiles` table with Row Level Security (RLS)
- Create `stores` table (organizations with Shopify connection)
- Create `store_members` table (users ↔ stores with roles)
- Create `funnels` table linked to stores
- Create `shopify_products` table linked to stores
- Create `sync_jobs` table linked to stores
- Set up database triggers for auto-profile creation
- Test all schemas and policies

## Multi-Tenant Architecture

- **Stores** = Organizations (1 Shopify connection per store)
- **Users** can belong to multiple stores
- **Roles** per store: `owner`, `admin`, `member`
- **Funnels** belong to stores (shared by all members)
- **Products** cached per store

## Prerequisites

- ✅ Task 00 completed (Supabase project set up)
- Supabase dashboard access
- Understanding of PostgreSQL and RLS

## Steps

### 1. Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project (`boron-builder-dev`)
3. Click "SQL Editor" in left sidebar
4. Click "New query"

### 2. Create Profiles Table

Paste and run this SQL:

```sql
-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comment
COMMENT ON TABLE profiles IS 'User profile data (no Shopify connection here - moved to stores)';

-- Indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
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

-- Trigger on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Click **Run** or press `Ctrl+Enter`

### 3. Create Stores Table

Create a **new query** and run:

```sql
-- ============================================
-- STORES TABLE (Organizations)
-- ============================================

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL, -- URL-friendly name

  -- Shopify connection (one per store)
  shopify_connected boolean DEFAULT false,
  shopify_store_domain text,
  shopify_access_token text, -- Encrypted by Supabase

  -- Billing/plan info (future)
  plan text DEFAULT 'free', -- 'free' | 'pro' | 'enterprise'
  seat_limit integer DEFAULT 1, -- Max members allowed

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comment
COMMENT ON TABLE stores IS 'Organizations/stores - each has one Shopify connection';

-- Indexes
CREATE INDEX IF NOT EXISTS stores_slug_idx ON stores(slug);
CREATE INDEX IF NOT EXISTS stores_shopify_domain_idx ON stores(shopify_store_domain);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see stores they're members of
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

-- Updated timestamp trigger
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Create Store Members Table

Create a **new query** and run:

```sql
-- ============================================
-- STORE MEMBERS TABLE (Junction)
-- ============================================

CREATE TABLE IF NOT EXISTS store_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'

  -- Metadata
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz DEFAULT now(),

  -- Constraints
  UNIQUE(store_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member'))
);

-- Add comment
COMMENT ON TABLE store_members IS 'Junction table: users ↔ stores with roles';

-- Indexes
CREATE INDEX IF NOT EXISTS store_members_store_id_idx ON store_members(store_id);
CREATE INDEX IF NOT EXISTS store_members_user_id_idx ON store_members(user_id);
CREATE INDEX IF NOT EXISTS store_members_role_idx ON store_members(role);

-- Enable RLS
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Function to ensure at least one owner per store
CREATE OR REPLACE FUNCTION ensure_store_has_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent deleting the last owner
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
```

### 5. Create Funnels Table

Create a **new query** and run:

```sql
-- ============================================
-- FUNNELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  status text DEFAULT 'draft', -- 'draft' | 'published' | 'archived'

  -- Funnel data (complete JSON from AI generation)
  funnel_data jsonb NOT NULL,

  -- Optional Shopify product link
  shopify_product_id text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,

  -- Analytics (future use)
  views integer DEFAULT 0,
  conversions integer DEFAULT 0,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Add comment
COMMENT ON TABLE funnels IS 'Store funnels - shared by all store members';

-- Indexes
CREATE INDEX IF NOT EXISTS funnels_store_id_idx ON funnels(store_id);
CREATE INDEX IF NOT EXISTS funnels_created_by_idx ON funnels(created_by);
CREATE INDEX IF NOT EXISTS funnels_status_idx ON funnels(status);
CREATE INDEX IF NOT EXISTS funnels_shopify_product_id_idx ON funnels(shopify_product_id);
CREATE INDEX IF NOT EXISTS funnels_created_at_idx ON funnels(created_at DESC);

-- Enable RLS
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access funnels from their stores
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

-- Public access to published funnels (for future sharing)
CREATE POLICY "Anyone can view published funnels"
  ON funnels FOR SELECT
  USING (status = 'published');

-- Updated timestamp trigger
CREATE TRIGGER update_funnels_updated_at
  BEFORE UPDATE ON funnels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 6. Create Shopify Products Table

Create a **new query** and run:

```sql
-- ============================================
-- SHOPIFY PRODUCTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shopify_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_product_id text NOT NULL,

  -- Product data
  title text NOT NULL,
  description text,
  price numeric(10, 2),
  compare_at_price numeric(10, 2),
  currency text DEFAULT 'USD',

  -- Images
  images jsonb, -- Array of image URLs
  featured_image text,

  -- Variants
  variants jsonb, -- Array of variant objects

  -- Metadata
  tags text[],
  vendor text,
  product_type text,

  -- Sync tracking
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),

  -- Unique constraint
  UNIQUE(store_id, shopify_product_id)
);

-- Add comment
COMMENT ON TABLE shopify_products IS 'Cached Shopify product data per store';

-- Indexes
CREATE INDEX IF NOT EXISTS shopify_products_store_id_idx ON shopify_products(store_id);
CREATE INDEX IF NOT EXISTS shopify_products_shopify_id_idx ON shopify_products(shopify_product_id);
CREATE INDEX IF NOT EXISTS shopify_products_last_synced_idx ON shopify_products(last_synced_at);

-- Enable RLS
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access products from their stores
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
```

### 7. Create Sync Jobs Table

Create a **new query** and run:

```sql
-- ============================================
-- SYNC JOBS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  triggered_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending', -- 'pending' | 'running' | 'completed' | 'failed'
  type text NOT NULL, -- 'shopify_products' | 'shopify_orders'

  -- Results
  products_synced integer DEFAULT 0,
  errors jsonb,

  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_sync_status CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  CONSTRAINT valid_sync_type CHECK (type IN ('shopify_products', 'shopify_orders'))
);

-- Add comment
COMMENT ON TABLE sync_jobs IS 'Tracking Shopify sync operations per store';

-- Indexes
CREATE INDEX IF NOT EXISTS sync_jobs_store_id_idx ON sync_jobs(store_id);
CREATE INDEX IF NOT EXISTS sync_jobs_status_idx ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS sync_jobs_created_at_idx ON sync_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view sync jobs from their stores
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
```

### 8. Verify Tables Created

Run this query to check all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'stores', 'store_members', 'funnels', 'shopify_products', 'sync_jobs')
ORDER BY table_name;
```

Expected output:
```
table_name
-------------
funnels
profiles
shopify_products
store_members
stores
sync_jobs
```

### 9. Test RLS Policies

Create a test user and verify RLS works:

```sql
-- This should fail (no authenticated user)
SELECT * FROM profiles;
-- Expected: "new row violates row-level security policy"

-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'stores', 'store_members', 'funnels', 'shopify_products', 'sync_jobs')
ORDER BY tablename, policyname;
```

### 10. View Database Schema

In Supabase dashboard:
1. Go to "Table Editor"
2. You should see all 6 tables:
   - `profiles`
   - `stores`
   - `store_members`
   - `funnels`
   - `shopify_products`
   - `sync_jobs`

Click each table to inspect columns and structure.

## Acceptance Criteria

- ✅ All 6 tables created successfully
- ✅ RLS enabled on all tables
- ✅ Policies created and showing in `pg_policies`
- ✅ Triggers created for `updated_at` columns
- ✅ Profile auto-creation trigger set up
- ✅ Store owner protection trigger (prevent removing last owner)
- ✅ Indexes created for performance
- ✅ Constraints enforced (status values, unique constraints, roles)
- ✅ Tables visible in Supabase Table Editor
- ✅ Multi-tenant architecture working (stores → members → funnels)

## Testing the Schema

### Test Profile Creation Trigger

When a user signs up in the next tasks, the `handle_new_user()` function should automatically create a profile row. We'll test this in Task 03.

### Test Funnel Insertion

Run this test query (will fail due to RLS, which is good):

```sql
-- This should fail (no authenticated user)
INSERT INTO funnels (user_id, name, funnel_data)
VALUES (gen_random_uuid(), 'Test Funnel', '{}');
```

Expected: RLS policy violation error ✅

## Database Schema Diagram

Your multi-tenant database now looks like this:

```
auth.users (Supabase managed)
    ↓ (id)
profiles (user data)
    ↓
    │
    ├─→ store_members ←─┐
    │   (junction)      │ (many-to-many)
    │   • role          │
    │   • joined_at     │
    │                   │
    └───────────────────┘
                        │
                   ↓ (store_id FK)
                   stores (organization)
                   • name, slug
                   • shopify_connected
                   • shopify_access_token
                   • plan, seat_limit
                        ↓ (store_id FK)
                        ├─→ funnels
                        │   • created_by
                        │   • funnel_data
                        │
                        ├─→ shopify_products
                        │   • product data cache
                        │
                        └─→ sync_jobs
                            • triggered_by
                            • sync results
```

**Key Points:**
- Users can belong to multiple stores
- Stores can have multiple users (members)
- Each store has its own Shopify connection
- Funnels, products, and sync jobs belong to stores (shared by all members)
- Roles determine permissions within each store

## Troubleshooting

### "relation already exists" error

Tables might already exist. Drop and recreate:

```sql
DROP TABLE IF EXISTS sync_jobs CASCADE;
DROP TABLE IF EXISTS shopify_products CASCADE;
DROP TABLE IF EXISTS funnels CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Then re-run all CREATE TABLE statements
```

### Trigger not firing

Check trigger exists:

```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';
```

### RLS blocking everything

Verify you're testing with an authenticated session. RLS is working correctly if queries fail without auth!

## Next Steps

1. ✅ Verify all tables in Supabase Table Editor
2. ✅ Take a screenshot or note of your database structure
3. ➡️ **Proceed to Task 02: Auth Infrastructure**

## Quick Reference

**Supabase SQL Editor:** Dashboard → SQL Editor
**Table Editor:** Dashboard → Table Editor
**API Docs:** Dashboard → API Docs (auto-generated from schema!)

---

**Status:** ⏳ Complete this task before moving to Task 02
