# Boron Builder: Authentication & Shopify Integration

**Status:** 🔄 Ready to Implement
**Start Date:** TBD
**Estimated Duration:** 17-24 days

## Overview

This project adds user authentication and Shopify store integration to Boron Builder, enabling users to:
- Create accounts and sign in
- Save and manage multiple funnels
- Connect their Shopify store
- Auto-sync product data for funnel generation

## Documentation

- **[spec.md](./spec.md)** - Complete technical specification and design doc
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - ⭐ Start here! Implementation roadmap and workflow guide

## Key Features

### 1. User Authentication (Supabase)
- Email/password sign up and sign in
- Email verification
- Password recovery
- Protected routes and user sessions

### 2. Funnel Management
- Save funnels as drafts
- Edit and update saved funnels
- Publish funnels
- Delete/archive funnels
- Dashboard to view all funnels

### 3. Shopify Integration
- OAuth connection to Shopify store
- Initial product sync on connection
- Periodic background sync (every 6 hours)
- Product cache for fast access
- Link funnels to specific Shopify products

## Tech Stack

### New Dependencies
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-nextjs` - Next.js auth integration
- `@shopify/shopify-api` - Shopify API client

### Services
- **Supabase** - Auth, Database, Storage
- **Shopify API** - Product data sync
- **Vercel Cron** - Periodic sync jobs (optional)

## Database Schema

### Main Tables
- `profiles` - User profile data, Shopify connection status
- `funnels` - User-created funnels with draft/published status
- `shopify_products` - Cached Shopify product data
- `sync_jobs` - Tracking product sync operations

See [spec.md](./spec.md#database-schema) for complete schema details.

## Implementation Tasks

| # | Task | Time | Status |
|---|------|------|--------|
| 00 | [Supabase & Shopify Setup](./00-setup.md) | 3h | ⏳ Not Started |
| 01 | [Database Schema](./01-database-schema.md) | 2h | ⏳ Not Started |
| 02 | Auth Infrastructure | 3h | ⏳ Not Started |
| 03 | Auth Pages | 4h | ⏳ Not Started |
| 04 | Auth UI | 2h | ⏳ Not Started |
| 05 | Funnel API | 4h | ⏳ Not Started |
| 06 | Dashboard | 5h | ⏳ Not Started |
| 07 | Funnel Editor | 4h | ⏳ Not Started |
| 08 | Shopify OAuth | 5h | ⏳ Not Started |
| 09 | Shopify Sync | 5h | ⏳ Not Started |
| 10 | Shopify UI | 3h | ⏳ Not Started |
| 11 | Webhooks (Optional) | 4h | ⏳ Not Started |
| 12 | Testing | 5h | ⏳ Not Started |
| 13 | Polish | 3h | ⏳ Not Started |
| 14 | Deployment | 2h | ⏳ Not Started |

**Total:** ~54 hours (17-24 days at 4-6 hours/day)

## Environment Setup

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Shopify
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_SCOPES=read_products,read_product_listings
SHOPIFY_REDIRECT_URI=

# Existing
ANTHROPIC_API_KEY=
```

## Getting Started

### Prerequisites
1. Supabase account - [Sign up](https://supabase.com)
2. Shopify Partners account - [Sign up](https://partners.shopify.com)
3. Create Shopify app in Partners dashboard

### Setup Steps
1. Review [spec.md](./spec.md) and provide feedback
2. Create Supabase project
3. Create Shopify app
4. Set up environment variables
5. Run database migrations
6. Begin Phase 1 implementation

## Open Questions

See [spec.md - Open Questions](./spec.md#open-questions) for discussion points:
- Funnel publishing strategy
- Pricing/plans implementation
- Multi-store support
- Product selection flow
- Sync frequency optimization

## Success Metrics

- User signups and retention
- Funnels saved per user
- Shopify connection rate
- Successful product syncs
- Funnel publish rate

## Future Enhancements

- Custom domains for published funnels
- A/B testing
- Analytics dashboard
- Email capture integration
- Team collaboration
- Funnel templates marketplace

---

**Next:** Review spec.md and begin Phase 1 implementation
