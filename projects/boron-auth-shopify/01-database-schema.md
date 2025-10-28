# Task 01: Database Schema Setup

⏱ **Estimated Time:** 2 hours

## Objectives

- Create `profiles` table with Row Level Security (RLS)
- Create `funnels` table with RLS
- Create `shopify_products` table with RLS
- Create `sync_jobs` table with RLS
- Set up database triggers for auto-profile creation
- Test all schemas and policies

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
  shopify_connected boolean DEFAULT false,
  shopify_store_domain text,
  shopify_access_token text, -- Will be encrypted by Supabase
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comment
COMMENT ON TABLE profiles IS 'User profile data and Shopify connection info';

-- Indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_shopify_connected_idx ON profiles(shopify_connected);

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

### 3. Create Funnels Table

Create a **new query** and run:

```sql
-- ============================================
-- FUNNELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
COMMENT ON TABLE funnels IS 'User-created funnels with AI-generated content';

-- Indexes
CREATE INDEX IF NOT EXISTS funnels_user_id_idx ON funnels(user_id);
CREATE INDEX IF NOT EXISTS funnels_status_idx ON funnels(status);
CREATE INDEX IF NOT EXISTS funnels_shopify_product_id_idx ON funnels(shopify_product_id);
CREATE INDEX IF NOT EXISTS funnels_created_at_idx ON funnels(created_at DESC);

-- Enable RLS
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own funnels"
  ON funnels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funnels"
  ON funnels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funnels"
  ON funnels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own funnels"
  ON funnels FOR DELETE
  USING (auth.uid() = user_id);

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

### 4. Create Shopify Products Table

Create a **new query** and run:

```sql
-- ============================================
-- SHOPIFY PRODUCTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shopify_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  UNIQUE(user_id, shopify_product_id)
);

-- Add comment
COMMENT ON TABLE shopify_products IS 'Cached Shopify product data for fast access';

-- Indexes
CREATE INDEX IF NOT EXISTS shopify_products_user_id_idx ON shopify_products(user_id);
CREATE INDEX IF NOT EXISTS shopify_products_shopify_id_idx ON shopify_products(shopify_product_id);
CREATE INDEX IF NOT EXISTS shopify_products_last_synced_idx ON shopify_products(last_synced_at);

-- Enable RLS
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own products"
  ON shopify_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own products"
  ON shopify_products FOR ALL
  USING (auth.uid() = user_id);
```

### 5. Create Sync Jobs Table

Create a **new query** and run:

```sql
-- ============================================
-- SYNC JOBS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
COMMENT ON TABLE sync_jobs IS 'Tracking Shopify sync operations';

-- Indexes
CREATE INDEX IF NOT EXISTS sync_jobs_user_id_idx ON sync_jobs(user_id);
CREATE INDEX IF NOT EXISTS sync_jobs_status_idx ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS sync_jobs_created_at_idx ON sync_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sync jobs"
  ON sync_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sync jobs"
  ON sync_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 6. Verify Tables Created

Run this query to check all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'funnels', 'shopify_products', 'sync_jobs')
ORDER BY table_name;
```

Expected output:
```
table_name
-------------
funnels
profiles
shopify_products
sync_jobs
```

### 7. Test RLS Policies

Create a test user and verify RLS works:

```sql
-- This should fail (no authenticated user)
SELECT * FROM profiles;
-- Expected: "new row violates row-level security policy"

-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'funnels', 'shopify_products', 'sync_jobs')
ORDER BY tablename, policyname;
```

### 8. View Database Schema

In Supabase dashboard:
1. Go to "Table Editor"
2. You should see all 4 tables:
   - `profiles`
   - `funnels`
   - `shopify_products`
   - `sync_jobs`

Click each table to inspect columns and structure.

## Acceptance Criteria

- ✅ All 4 tables created successfully
- ✅ RLS enabled on all tables
- ✅ Policies created and showing in `pg_policies`
- ✅ Triggers created for `updated_at` columns
- ✅ Profile auto-creation trigger set up
- ✅ Indexes created for performance
- ✅ Constraints enforced (status values, unique constraints)
- ✅ Tables visible in Supabase Table Editor

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

Your database now looks like this:

```
auth.users (Supabase managed)
    ↓ (id)
profiles
    ↓ (user_id FK)
    ├─→ funnels
    ├─→ shopify_products
    └─→ sync_jobs
```

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
