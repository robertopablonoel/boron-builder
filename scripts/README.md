# Utility Scripts

## Database Verification

### verify-schema.ts

Verifies that the Supabase database schema is correctly set up with all tables and RLS policies.

```bash
npx tsx scripts/verify-schema.ts
```

**When to use:**
- After running database migrations
- To troubleshoot database issues
- To verify local or remote database setup

**Requirements:**
- Supabase credentials in `.env.local`
- For local: Supabase must be running (`supabase start`)
