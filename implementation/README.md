# Boron Builder - Implementation Guide

This directory contains step-by-step implementation tasks for building Boron Builder MVP.

## Overview

Each task is a separate markdown file with:
- Clear objectives
- Prerequisites
- Detailed implementation steps
- Code examples
- Acceptance criteria
- Estimated time

## Recommended Order

Follow these tasks in sequence:

### Phase 1: Foundation (16-20 hours)

1. **[Task 00: Project Setup](./00-setup.md)** ⏱ 2 hours
   - Initialize Next.js 14 project
   - Configure Tailwind CSS
   - Set up TypeScript
   - Install dependencies

2. **[Task 01: Schema Definitions](./01-schemas.md)** ⏱ 4 hours
   - Define all Zod schemas for blocks
   - Create validation functions
   - Type definitions

3. **[Task 02: State Management](./02-stores.md)** ⏱ 3 hours
   - Set up Zustand stores
   - Chat state management
   - Funnel state management
   - LocalStorage persistence

4. **[Task 03: System Prompt](./03-prompt.md)** ⏱ 4 hours
   - Write system prompt
   - Test prompt variations
   - Document prompt guidelines

5. **[Task 04: API Route](./04-api.md)** ⏱ 3 hours
   - Create Claude API endpoint
   - Handle streaming responses
   - Error handling

### Phase 2: Block Library (20-24 hours)

6. **[Task 05: Block Components - Core](./05-blocks-core.md)** ⏱ 6 hours
   - Banner component
   - Callout component
   - Text component
   - IconGroup component

7. **[Task 06: Block Components - eCommerce](./06-blocks-ecommerce.md)** ⏱ 8 hours
   - AddToCartButton component
   - VariantSelector component
   - ProductGrid component
   - ProductImageCarousel component
   - UpsellCarousel component

8. **[Task 07: Block Components - Media & Social](./07-blocks-media.md)** ⏱ 6 hours
   - Media component
   - MediaCarousel component
   - Reviews component
   - Accordions component

9. **[Task 08: Renderer System](./08-renderer.md)** ⏱ 3 hours
   - FunnelRenderer component
   - BlockRegistry
   - Device frame wrapper

### Phase 3: UI/UX (12-16 hours)

10. **[Task 09: Chat Interface](./09-chat-interface.md)** ⏱ 6 hours
    - ChatPane component
    - MessageList component
    - MessageInput component
    - Loading states

11. **[Task 10: Preview Interface](./10-preview-interface.md)** ⏱ 4 hours
    - PreviewPane component
    - Device toggle
    - Empty states

12. **[Task 11: Main Layout](./11-main-layout.md)** ⏱ 2 hours
    - Page composition
    - Responsive layout
    - Split pane design

13. **[Task 12: UI Polish](./12-ui-polish.md)** ⏱ 4 hours
    - Error handling UI
    - Loading animations
    - Toast notifications
    - Accessibility improvements

### Phase 4: Testing & Optimization (8-10 hours)

14. **[Task 13: Testing](./13-testing.md)** ⏱ 6 hours
    - Unit tests for schemas
    - Component tests
    - Integration tests

15. **[Task 14: Optimization](./14-optimization.md)** ⏱ 4 hours
    - Performance optimization
    - Bundle size reduction
    - Lazy loading

### Phase 5: Deployment (2-3 hours)

16. **[Task 15: Deployment](./15-deployment.md)** ⏱ 3 hours
    - Environment setup
    - Vercel deployment
    - Monitoring setup

## Progress Tracking

- [ ] Task 00: Project Setup
- [ ] Task 01: Schema Definitions
- [ ] Task 02: State Management
- [ ] Task 03: System Prompt
- [ ] Task 04: API Route
- [ ] Task 05: Block Components - Core
- [ ] Task 06: Block Components - eCommerce
- [ ] Task 07: Block Components - Media & Social
- [ ] Task 08: Renderer System
- [ ] Task 09: Chat Interface
- [ ] Task 10: Preview Interface
- [ ] Task 11: Main Layout
- [ ] Task 12: UI Polish
- [ ] Task 13: Testing
- [ ] Task 14: Optimization
- [ ] Task 15: Deployment

## Total Estimated Time

**64-82 hours** (2-3 weeks solo, 1-2 weeks with 2 developers)

## Getting Help

- Review the main plan: `../boron_builder_plan.md`
- Each task has detailed code examples
- Test incrementally after each task
- Don't skip prerequisites

## Quick Start

```bash
# Start with Task 00
cd implementation
open 00-setup.md

# Follow tasks in order
# Each task builds on the previous ones
```

---

**Note:** Each task file is self-contained with all the code and instructions you need. Start with Task 00 and work through them sequentially.
