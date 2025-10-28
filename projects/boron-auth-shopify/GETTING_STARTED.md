# Getting Started with Auth & Shopify Integration

This guide will help you implement authentication and Shopify integration for Boron Builder.

## Overview

This project adds user authentication (Supabase) and Shopify store integration to the existing Boron Builder MVP. Users will be able to save funnels, manage them in a dashboard, and sync product data from Shopify.

## Implementation Approach

The implementation is broken down into **numbered task files** (`00-XX.md`), each representing a discrete, completable unit of work. Complete them in order.

## Task Breakdown

### Phase 1: Authentication Foundation (Tasks 00-04)
| Task | File | Time | Description |
|------|------|------|-------------|
| 00 | `00-setup.md` | 3h | Supabase & Shopify account setup |
| 01 | `01-database-schema.md` | 2h | Create all database tables |
| 02 | `02-auth-infrastructure.md` | 3h | Supabase clients & auth utilities |
| 03 | `03-auth-pages.md` | 4h | Sign up, sign in, password reset pages |
| 04 | `04-auth-ui.md` | 2h | Header updates & user menu |

**Deliverable:** Users can sign up, sign in, and see authenticated UI

### Phase 2: Funnel Management (Tasks 05-07)
| Task | File | Time | Description |
|------|------|------|-------------|
| 05 | `05-funnel-api.md` | 4h | Funnel CRUD API routes |
| 06 | `06-dashboard.md` | 5h | Dashboard page & funnel list |
| 07 | `07-funnel-editor.md` | 4h | Funnel editor & actions |

**Deliverable:** Users can save, view, edit, and delete funnels

### Phase 3: Shopify Integration (Tasks 08-10)
| Task | File | Time | Description |
|------|------|------|-------------|
| 08 | `08-shopify-oauth.md` | 5h | OAuth connection flow |
| 09 | `09-shopify-sync.md` | 5h | Product sync infrastructure |
| 10 | `10-shopify-ui.md` | 3h | Settings page & product picker |

**Deliverable:** Users can connect Shopify and sync products

### Phase 4: Polish & Deploy (Tasks 11-14)
| Task | File | Time | Description |
|------|------|------|-------------|
| 11 | `11-webhooks.md` | 4h | Real-time product webhooks (optional) |
| 12 | `12-testing.md` | 5h | E2E and unit tests |
| 13 | `13-polish.md` | 3h | UX improvements |
| 14 | `14-deployment.md` | 2h | Production deployment |

**Deliverable:** Production-ready feature

## Quick Start

### 1. Prerequisites

- ✅ Boron Builder MVP completed and working
- ✅ Node.js 18+ installed
- ✅ Git repository set up
- Email for Supabase account
- Email for Shopify Partners account

### 2. Start with Task 00

```bash
cd /Users/robertonoel/Desktop/repos/boron
git checkout -b feature/auth-shopify

# Open the first task
open projects/boron-auth-shopify/00-setup.md
```

### 3. Work Through Tasks Sequentially

Each task file contains:
- ⏱ Estimated time
- 📋 Clear objectives
- ✅ Prerequisites checklist
- 📝 Step-by-step instructions with code
- ✔️ Acceptance criteria
- 🐛 Troubleshooting section
- ➡️ Next steps

### 4. Track Your Progress

Mark tasks as complete:
- [ ] Task 00: Supabase & Shopify Setup
- [ ] Task 01: Database Schema
- [ ] Task 02: Auth Infrastructure
- [ ] Task 03: Auth Pages
- [ ] Task 04: Auth UI
- [ ] Task 05: Funnel API
- [ ] Task 06: Dashboard
- [ ] Task 07: Funnel Editor
- [ ] Task 08: Shopify OAuth
- [ ] Task 09: Shopify Sync
- [ ] Task 10: Shopify UI
- [ ] Task 11: Webhooks (optional)
- [ ] Task 12: Testing
- [ ] Task 13: Polish
- [ ] Task 14: Deployment

## Development Workflow

### For Each Task

1. **Read the task file completely** before starting
2. **Check prerequisites** are met
3. **Follow steps in order**
4. **Test as you go** (each task has acceptance criteria)
5. **Commit your work** before moving to next task

```bash
# Example workflow for Task 00
git add .
git commit -m "feat(setup): complete Task 00 - Supabase & Shopify setup"
```

### Commit Message Format

```bash
feat(auth): add sign up page           # New feature
fix(api): handle expired tokens        # Bug fix
test(e2e): add dashboard tests         # Tests
docs(readme): update setup instructions # Docs
refactor(ui): simplify user menu       # Refactor
```

## Estimated Timeline

| What | Time |
|------|------|
| Phase 1: Auth | 3-5 days |
| Phase 2: Funnels | 4-6 days |
| Phase 3: Shopify | 6-8 days |
| Phase 4: Polish | 4-5 days |
| **Total** | **17-24 days** |

*Working 4-6 hours per day*

## File Structure

After completion, your project will have:

```
boron/
├── app/
│   ├── auth/                    # NEW: Auth pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── dashboard/               # NEW: User dashboard
│   │   ├── page.tsx            # Funnel list
│   │   ├── funnels/[id]/       # Funnel editor
│   │   └── settings/           # Settings page
│   └── api/
│       ├── funnels/             # NEW: Funnel API
│       └── shopify/             # NEW: Shopify API
├── components/
│   ├── providers/
│   │   └── AuthProvider.tsx    # NEW: Auth context
│   ├── dashboard/               # NEW: Dashboard components
│   └── shopify/                 # NEW: Shopify components
└── lib/
    ├── supabase/                # NEW: Supabase clients
    └── shopify/                 # NEW: Shopify utilities
```

## Support & Resources

### Documentation
- [spec.md](./spec.md) - Technical specification
- [README.md](./README.md) - Project overview

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Shopify API Docs](https://shopify.dev/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

### Common Issues

**"I'm stuck on a task"**
- Check the Troubleshooting section in the task file
- Review the acceptance criteria - are you trying to do too much?
- Skip optional sections and come back later

**"Tests are failing"**
- Each task has specific acceptance criteria
- Test each feature in isolation
- Don't move to next task until current one passes

**"I want to skip ahead"**
- Don't! Tasks build on each other
- Skipping will cause missing dependencies

## Tips for Success

✅ **Do:**
- Read entire task before starting
- Test frequently as you build
- Commit after each task
- Ask questions early
- Take breaks between tasks

❌ **Don't:**
- Skip prerequisites
- Rush through setup
- Forget to test
- Mix multiple tasks in one commit
- Work on multiple tasks simultaneously

## Ready to Start?

1. Open `00-setup.md`
2. Follow the instructions
3. Complete the acceptance criteria
4. Move to `01-database-schema.md`

Good luck! 🚀

---

**Questions?** Review the spec.md file or check task-specific Troubleshooting sections.
