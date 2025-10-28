# Supabase Quick Reference

## Essential Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (re-run migrations)
supabase db reset

# View local dashboard
open http://127.0.0.1:54323

# Verify schema
npx tsx scripts/verify-schema.ts
```

## Local URLs

- **Studio Dashboard**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321
- **Email Testing**: http://127.0.0.1:54324
- **Database**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## Database Tables

1. **profiles** - User data
2. **stores** - Organizations
3. **store_members** - User roles in stores
4. **store_invites** - Pending invitations
5. **funnels** - Sales funnels
6. **shopify_products** - Product cache
7. **sync_jobs** - Sync tracking

## Environment Switch

**Local (default):**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```

**Remote:**
Uncomment remote credentials in `.env.local`

## Files

- `README.md` - Main documentation
- `DATABASE.md` - Schema details
- `MIGRATION.md` - Migration instructions
- `config.toml` - Supabase configuration
- `migrations/` - SQL migrations

## Client Usage

```typescript
// Browser
import { createClient } from '@/lib/supabase/client'

// Server Component
import { createClient } from '@/lib/supabase/server'

// Middleware
import { updateSession } from '@/lib/supabase/middleware'
```
