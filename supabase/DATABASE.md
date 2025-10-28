# Database Setup Complete! 🎉

## What Was Implemented

### ✅ Database Schema (7 Tables)

1. **profiles** - User profile data
2. **stores** - Organizations with Shopify connections
3. **store_members** - Users ↔ Stores with roles (owner/admin/member)
4. **store_invites** - Pending team invitations
5. **funnels** - Sales funnels (shared by store members)
6. **shopify_products** - Cached Shopify product data
7. **sync_jobs** - Tracking sync operations

### ✅ Security

- Row Level Security (RLS) enabled on all tables
- 19 RLS policies for multi-tenant data isolation
- Role-based access control (owner, admin, member)
- Automatic profile creation on signup

### ✅ Triggers & Functions

- `update_updated_at_column()` - Auto-update timestamps
- `handle_new_user()` - Auto-create profile on signup
- `ensure_store_has_owner()` - Prevent removing last owner
- `expire_old_invites()` - Auto-expire old invites

### ✅ Supabase Client Utilities

- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server-side client
- `lib/supabase/middleware.ts` - Middleware for auth
- `lib/supabase/types.ts` - TypeScript types

## Local Development Setup

### Running Supabase Locally

```bash
# Start local Supabase (includes all services)
supabase start

# View local dashboard
open http://127.0.0.1:54323

# Stop local Supabase
supabase stop

# Reset database (re-run migrations)
supabase db reset
```

### Local Supabase Services

- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323
- **Inbucket** (Email): http://127.0.0.1:54324
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

## Configuration

### Current Setup

The project is configured to use **local Supabase** by default (`.env.local`).

To switch to **remote Supabase**, uncomment the remote credentials in `.env.local`.

### Environment Variables

```bash
# Local (Active)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Remote (Available)
# NEXT_PUBLIC_SUPABASE_URL=https://ttzsrtpowrysrcmaogfu.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema Overview

```
auth.users (Supabase managed)
    ↓
profiles (1:1)
    ↓
store_members (M:M junction)
    ↓
stores (organization)
    ├─→ funnels (shared by team)
    ├─→ shopify_products (cached data)
    ├─→ sync_jobs (sync tracking)
    └─→ store_invites (pending invites)
```

## Key Features

### Multi-Tenant Architecture

- Users can belong to multiple stores
- Each store has its own Shopify connection
- Role-based permissions per store
- Data isolation via RLS policies

### User Roles

- **Owner**: Full control, can manage members, delete store
- **Admin**: Can invite members, manage funnels
- **Member**: Can create/edit funnels, view products

## Next Steps

### 1. Implement Authentication

- Sign up/Sign in pages
- Protected routes
- Auth context provider

### 2. Create Store Management

- Create/join stores
- Invite team members
- Manage store settings

### 3. Implement Funnel Management

- Create funnels linked to stores
- Edit/delete funnels
- Publish funnels

### 4. Add Shopify Integration

- OAuth connection
- Product sync
- Link funnels to products

## Files Created

```
supabase/
├── config.toml                           # Supabase configuration
├── migrations/
│   ├── 20251028_initial_schema.sql       # Database migration
│   └── README.md                          # Migration instructions

lib/supabase/
├── client.ts                              # Browser client
├── server.ts                              # Server client
├── middleware.ts                          # Auth middleware
└── types.ts                               # TypeScript types

scripts/
├── verify-schema.ts                       # Verification script
├── run-migration.ts                       # Migration runner
└── migrate-psql.sh                        # psql migration script

# Documentation
├── MIGRATION_INSTRUCTIONS.md              # How to run migrations
└── DATABASE_SETUP_COMPLETE.md             # This file
```

## Verification

All tables and policies are verified and working:

```bash
# Verify schema
npx tsx scripts/verify-schema.ts

# Check tables in psql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

## Troubleshooting

### Port Already in Use

```bash
supabase stop
supabase start
```

### Reset Database

```bash
supabase db reset
```

### Switch to Remote Database

Edit `.env.local`:
- Comment out LOCAL credentials
- Uncomment REMOTE credentials
- Restart dev server

## Resources

- **Local Studio**: http://127.0.0.1:54323
- **Supabase Docs**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Migration Guide**: supabase/migrations/README.md

---

**Status**: ✅ Database schema fully implemented and tested locally!

**Ready for**: Authentication implementation (Task 02)
