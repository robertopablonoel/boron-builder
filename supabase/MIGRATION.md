# Database Migration Instructions

## Step 1: Execute SQL Migration

### Using Supabase Dashboard (Easiest Method)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on project: `ttzsrtpowrysrcmaogfu`

3. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New query** button

4. **Copy Migration SQL**
   - Open: `supabase/migrations/20251028_initial_schema.sql`
   - Copy all the contents (Cmd/Ctrl + A, then Cmd/Ctrl + C)

5. **Paste and Execute**
   - Paste into the SQL editor
   - Click **Run** button (or press Cmd/Ctrl + Enter)
   - Wait for execution (~10 seconds)
   - You should see "Success. No rows returned" message

## Step 2: Verify Migration

After running the SQL, verify it worked:

```bash
# Run verification script
npx tsx scripts/verify-schema.ts
```

Expected output:
```
✅ All tables created successfully!
✅ RLS policies applied!
🎉 Database schema is ready to use!
```

## Step 3: View Tables in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. You should see 7 new tables:
   - profiles
   - stores
   - store_members
   - store_invites
   - funnels
   - shopify_products
   - sync_jobs

## What Was Created

### Tables (7)
- **profiles**: User profile data
- **stores**: Organizations with Shopify connections
- **store_members**: Junction table for users ↔ stores
- **store_invites**: Pending team invitations
- **funnels**: Sales funnels linked to stores
- **shopify_products**: Cached Shopify product data
- **sync_jobs**: Tracking sync operations

### Functions (4)
- **update_updated_at_column()**: Auto-update timestamps
- **handle_new_user()**: Auto-create profile on signup
- **ensure_store_has_owner()**: Prevent removing last owner
- **expire_old_invites()**: Auto-expire old invites

### Security (RLS)
- Row Level Security enabled on all tables
- ~20 RLS policies for multi-tenant data isolation
- Role-based access control (owner, admin, member)

## Troubleshooting

### Error: "relation already exists"

Tables might already exist. Drop them first:

```sql
-- Run this in Supabase SQL Editor
DROP TABLE IF EXISTS sync_jobs CASCADE;
DROP TABLE IF EXISTS shopify_products CASCADE;
DROP TABLE IF EXISTS funnels CASCADE;
DROP TABLE IF EXISTS store_invites CASCADE;
DROP TABLE IF EXISTS store_members CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS ensure_store_has_owner() CASCADE;
DROP FUNCTION IF EXISTS expire_old_invites() CASCADE;
```

Then re-run the migration.

### Error: "permission denied"

Make sure you're using the correct Supabase project and have owner/admin access.

### Verification script fails

1. Check `.env.local` has correct credentials
2. Make sure migration ran successfully
3. Try refreshing Supabase dashboard

## Next Steps

After successful migration:

1. ✅ Schema is ready
2. ➡️ Create Supabase client utilities
3. ➡️ Implement authentication pages
4. ➡️ Test user signup/signin flow
