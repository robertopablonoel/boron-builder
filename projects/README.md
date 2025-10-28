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

---

## Adding New Projects

To add a new project implementation plan:

1. Create a new subdirectory: `projects/your-project-name/`
2. Add implementation documentation
3. Update this README with project details
