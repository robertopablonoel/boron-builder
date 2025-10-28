# Projects

This directory contains implementation plans and documentation for various projects.

## Structure

Each project has its own subdirectory with complete implementation documentation:

```
projects/
├── boron-builder/          # AI-powered funnel builder with Claude
│   ├── boron_builder_plan.md
│   ├── README.md
│   └── 00-15-*.md         # Step-by-step implementation guides
├── boron-auth-shopify/     # Auth & Shopify integration for Boron Builder
│   ├── spec.md
│   └── README.md
└── [future-projects]/
```

## Current Projects

### Boron Builder
**Status:** ✅ Complete (MVP deployed)

AI-powered eCommerce funnel builder using Claude 3.5 Sonnet. Generates high-converting product pages with 13 customizable block types.

- **Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Zustand, Zod
- **Documentation:** `boron-builder/README.md`
- **Implementation Plan:** `boron-builder/boron_builder_plan.md`
- **Repository:** [github.com/robertopablonoel/boron-builder](https://github.com/robertopablonoel/boron-builder)

### Boron Auth & Shopify Integration
**Status:** 🔄 Planning

Adds user authentication and Shopify store integration to Boron Builder. Enables users to save funnels, manage them in a dashboard, and sync product data from Shopify.

- **Tech Stack:** Supabase (Auth, Database), Shopify API, PostgreSQL
- **Documentation:** `boron-auth-shopify/README.md`
- **Specification:** `boron-auth-shopify/spec.md`
- **Estimated Duration:** 20-30 days

**Key Features:**
- User authentication with email/password
- Funnel management dashboard
- Shopify OAuth integration
- Automatic product data sync
- Draft/published funnel status

---

## Adding New Projects

To add a new project implementation plan:

1. Create a new subdirectory: `projects/your-project-name/`
2. Add implementation documentation
3. Update this README with project details
