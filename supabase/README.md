# Supabase Setup

This directory contains the Supabase configuration and database migrations for Boron Builder.

## Quick Start

```bash
# Start local Supabase (includes PostgreSQL, Auth, Storage, etc.)
supabase start

# Stop local Supabase
supabase stop

# Reset database (re-run migrations)
supabase db reset
```

## Local Services

Once started, you can access:

- **API**: http://127.0.0.1:54321
- **Studio** (Dashboard): http://127.0.0.1:54323
- **Inbucket** (Email testing): http://127.0.0.1:54324
- **Database**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Database Schema

The database is structured for multi-tenant SaaS with the following tables:

### Core Tables

- **profiles** - User profile data
- **stores** - Organizations with Shopify connections
- **store_members** - Users ↔ Stores with roles (owner/admin/member)
- **store_invites** - Pending team invitations
- **funnels** - Sales funnels (shared by store members)
- **shopify_products** - Cached Shopify product data
- **sync_jobs** - Tracking Shopify sync operations

### Architecture

```
auth.users (Supabase managed)
    ↓
profiles (1:1)
    ↓
store_members (M:M junction)
    ↓
stores (organization)
    ├─→ funnels
    ├─→ shopify_products
    ├─→ sync_jobs
    └─→ store_invites
```

### Security

- Row Level Security (RLS) enabled on all tables
- 19 RLS policies for multi-tenant data isolation
- Role-based access control (owner, admin, member)

## Migrations

Migrations are in `supabase/migrations/` and run automatically when you start Supabase.

### Current Migration

- `20251028_initial_schema.sql` - Initial database schema with all tables, triggers, and RLS policies

### Adding New Migrations

```bash
# Create a new migration
supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/

# Apply migration
supabase db reset
```

## Environment Configuration

The project uses local Supabase by default (`.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

To switch to remote Supabase, uncomment the remote credentials in `.env.local`.

## Client Utilities

TypeScript client utilities are in `lib/supabase/`:

- `client.ts` - Browser client
- `server.ts` - Server-side client (for Server Components/API routes)
- `middleware.ts` - Auth middleware
- `types.ts` - Database TypeScript types

## Troubleshooting

### Port Already in Use

```bash
supabase stop
supabase start
```

### Reset Everything

```bash
supabase stop
supabase db reset
supabase start
```

### View Logs

```bash
supabase logs db
```

## Additional Documentation

- [DATABASE.md](./DATABASE.md) - Complete database schema documentation
- [MIGRATION.md](./MIGRATION.md) - Migration instructions and troubleshooting
- [Supabase Docs](https://supabase.com/docs)
