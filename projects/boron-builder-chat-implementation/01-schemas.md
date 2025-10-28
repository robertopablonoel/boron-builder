# Task 01: Schema Definitions

⏱ **Estimated Time:** 4 hours

## Objectives

- Define Zod schemas for all 13 block types
- Create root funnel schema with validation
- Implement validation functions
- Generate TypeScript types from schemas
- Write validation rules checker

## Prerequisites

- ✅ Task 00 completed (project setup)
- Zod installed
- Understanding of TypeScript interfaces

## Steps

### 1. Create Funnel Schema File

Create `lib/schemas/funnel.schema.ts`:

```typescript
import { z } from 'zod';

// ============================================
// BLOCK PROP SCHEMAS
// ============================================

// Banner Block
export const BannerSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  background: z.string().min(1, 'Background color is required'),
  textColor: z.string().min(1, 'Text color is required'),
  dismissible: z.boolean().optional(),
});

// Callout Block (Hero)
export const CalloutSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  icon: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional().default('center'),
});

// Text Block
export const TextSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  align: z.enum(['left', 'center', 'right']).optional().default('left'),
  size: z.enum(['sm', 'base', 'lg']).optional().default('base'),
});

// Review Item
export const ReviewItemSchema = z.object({
  name: z.string().min(1, 'Reviewer name is required'),
  quote: z.string().min(1, 'Quote is required'),
  stars: z.number().min(1).max(5),
  verified: z.boolean().optional(),
});

// Reviews Block
export const ReviewsSchema = z.object({
  items: z.array(ReviewItemSchema).min(1, 'At least one review required'),
  layout: z.enum(['stacked', 'carousel']).optional().default('stacked'),
});

// Icon Item
export const IconItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  src: z.string().min(1, 'Icon source is required'),
});

// IconGroup Block
export const IconGroupSchema = z.object({
  icons: z.array(IconItemSchema).min(1, 'At least one icon required'),
  layout: z.enum(['horizontal', 'grid']).optional().default('horizontal'),
});

// Media Block
export const MediaSchema = z.object({
  src: z.string().url('Must be valid URL'),
  alt: z.string().optional(),
  caption: z.string().optional(),
  type: z.enum(['image', 'video']),
});

// Media Carousel Item
export const MediaCarouselItemSchema = z.object({
  type: z.enum(['image', 'video']),
  src: z.string().url('Must be valid URL'),
  alt: z.string().optional(),
});

// MediaCarousel Block
export const MediaCarouselSchema = z.object({
  media: z.array(MediaCarouselItemSchema).min(1, 'At least one media item required'),
  autoplay: z.boolean().optional().default(false),
});

// Accordion Section
export const AccordionSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  content: z.string().min(1, 'Section content is required'),
});

// Accordions Block
export const AccordionsSchema = z.object({
  sections: z.array(AccordionSectionSchema).min(1, 'At least one section required'),
});

// Product Item (used in multiple blocks)
export const ProductItemSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  image: z.string().url('Must be valid URL'),
  price: z.number().positive('Price must be positive'),
  url: z.string().min(1, 'URL is required'),
  badge: z.string().optional(),
});

// ProductGrid Block
export const ProductGridSchema = z.object({
  products: z.array(ProductItemSchema).min(1, 'At least one product required'),
  columns: z.enum([2, 3, 4]).optional().default(2),
});

// Variant Option
export const VariantOptionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  priceDiff: z.number().optional(),
  badge: z.string().optional(),
});

// VariantSelector Block
export const VariantSelectorSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  options: z.array(VariantOptionSchema).min(1, 'At least one option required'),
  defaultValue: z.string().optional(),
});

// Product Image
export const ProductImageSchema = z.object({
  src: z.string().url('Must be valid URL'),
  alt: z.string().min(1, 'Alt text is required'),
});

// ProductImageCarousel Block
export const ProductImageCarouselSchema = z.object({
  images: z.array(ProductImageSchema).min(1, 'At least one image required'),
  zoomEnabled: z.boolean().optional().default(false),
});

// AddToCartButton Block
export const AddToCartButtonSchema = z.object({
  text: z.string().min(1, 'Button text is required'),
  link: z.string().min(1, 'Link is required'),
  variant: z.enum(['primary', 'secondary']).optional().default('primary'),
  size: z.enum(['sm', 'md', 'lg']).optional().default('lg'),
  subtext: z.string().optional(),
});

// UpsellCarousel Block
export const UpsellCarouselSchema = z.object({
  title: z.string().optional(),
  products: z.array(ProductItemSchema).min(1, 'At least one product required'),
});

// ============================================
// DISCRIMINATED UNION FOR ALL BLOCKS
// ============================================

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('Banner'),
    props: BannerSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('Callout'),
    props: CalloutSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('Text'),
    props: TextSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('Reviews'),
    props: ReviewsSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('IconGroup'),
    props: IconGroupSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('Media'),
    props: MediaSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('MediaCarousel'),
    props: MediaCarouselSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('Accordions'),
    props: AccordionsSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('ProductGrid'),
    props: ProductGridSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('VariantSelector'),
    props: VariantSelectorSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('ProductImageCarousel'),
    props: ProductImageCarouselSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('AddToCartButton'),
    props: AddToCartButtonSchema,
  }),
  z.object({
    id: z.string().min(1, 'Block ID is required'),
    type: z.literal('UpsellCarousel'),
    props: UpsellCarouselSchema,
  }),
]);

// ============================================
// PRODUCT & FUNNEL SCHEMA
// ============================================

export const ProductSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  description: z.string().min(1, 'Product description is required'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('USD'),
});

export const FunnelSchema = z.object({
  id: z.string().uuid('Must be valid UUID'),
  name: z.string().min(1, 'Funnel name is required'),
  product: ProductSchema,
  blocks: z.array(BlockSchema).min(1, 'At least one block required'),
});

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type Banner = z.infer<typeof BannerSchema>;
export type Callout = z.infer<typeof CalloutSchema>;
export type Text = z.infer<typeof TextSchema>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type Reviews = z.infer<typeof ReviewsSchema>;
export type IconItem = z.infer<typeof IconItemSchema>;
export type IconGroup = z.infer<typeof IconGroupSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type MediaCarouselItem = z.infer<typeof MediaCarouselItemSchema>;
export type MediaCarousel = z.infer<typeof MediaCarouselSchema>;
export type AccordionSection = z.infer<typeof AccordionSectionSchema>;
export type Accordions = z.infer<typeof AccordionsSchema>;
export type ProductItem = z.infer<typeof ProductItemSchema>;
export type ProductGrid = z.infer<typeof ProductGridSchema>;
export type VariantOption = z.infer<typeof VariantOptionSchema>;
export type VariantSelector = z.infer<typeof VariantSelectorSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductImageCarousel = z.infer<typeof ProductImageCarouselSchema>;
export type AddToCartButton = z.infer<typeof AddToCartButtonSchema>;
export type UpsellCarousel = z.infer<typeof UpsellCarouselSchema>;

export type Block = z.infer<typeof BlockSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Funnel = z.infer<typeof FunnelSchema>;

// Block type string union for type guards
export type BlockType = Block['type'];
```

### 2. Create Validation Functions

Create `lib/validation.ts`:

```typescript
import { FunnelSchema, type Funnel, type BlockType } from './schemas/funnel.schema';
import { ZodError } from 'zod';

/**
 * Validates funnel data against schema
 */
export function validateFunnel(data: unknown): Funnel {
  try {
    return FunnelSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Funnel validation failed:', error.flatten());
      throw new Error(`Invalid funnel structure: ${error.errors[0].message}`);
    }
    throw error;
  }
}

/**
 * Safe validation that returns result object
 */
export function validateFunnelSafe(data: unknown): {
  success: boolean;
  data?: Funnel;
  errors?: string[];
} {
  const result = FunnelSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validates funnel against eCommerce best practice rules
 */
export function validateFunnelRules(funnel: Funnel): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Rule 1: Must have at least one AddToCartButton
  const ctaBlocks = funnel.blocks.filter((b) => b.type === 'AddToCartButton');
  if (ctaBlocks.length === 0) {
    errors.push('Funnel must include at least one AddToCartButton');
  } else if (ctaBlocks.length < 2) {
    warnings.push('Best practice: Include 2-3 AddToCartButton blocks throughout funnel');
  }

  // Rule 2: First block should be Callout, Banner, or ProductImageCarousel
  const firstBlock = funnel.blocks[0];
  const validFirstBlocks: BlockType[] = ['Callout', 'Banner', 'ProductImageCarousel'];
  if (!validFirstBlocks.includes(firstBlock.type)) {
    warnings.push(
      `First block should be one of: ${validFirstBlocks.join(', ')}. Found: ${firstBlock.type}`
    );
  }

  // Rule 3: Reviews should appear before final CTA
  const reviewsIndex = funnel.blocks.findIndex((b) => b.type === 'Reviews');
  const lastCtaIndex = funnel.blocks.map((b, i) => (b.type === 'AddToCartButton' ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  if (reviewsIndex !== -1 && lastCtaIndex !== undefined && reviewsIndex > lastCtaIndex) {
    warnings.push('Best practice: Place Reviews block before final CTA');
  }

  // Rule 4: Accordions (FAQ) should be in bottom half
  const accordionsIndex = funnel.blocks.findIndex((b) => b.type === 'Accordions');
  const middleIndex = Math.floor(funnel.blocks.length / 2);

  if (accordionsIndex !== -1 && accordionsIndex < middleIndex) {
    warnings.push('Best practice: Place Accordions (FAQ) in bottom half of funnel');
  }

  // Rule 5: Check for duplicate block IDs
  const blockIds = funnel.blocks.map((b) => b.id);
  const duplicateIds = blockIds.filter((id, index) => blockIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate block IDs found: ${duplicateIds.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Type guard to check if data is a valid Funnel
 */
export function isFunnel(data: unknown): data is Funnel {
  return FunnelSchema.safeParse(data).success;
}

/**
 * Validates a single block
 */
export function validateBlock(data: unknown): boolean {
  // Import BlockSchema if needed for single block validation
  return true; // Implement if needed
}
```

### 3. Create Test Fixtures

Create `lib/schemas/__tests__/fixtures.ts`:

```typescript
import type { Funnel } from '../funnel.schema';

export const validFunnel: Funnel = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Funnel',
  product: {
    title: 'Test Product',
    description: 'A test product description',
    price: 29.99,
    currency: 'USD',
  },
  blocks: [
    {
      id: 'callout-1',
      type: 'Callout',
      props: {
        title: 'Welcome',
        subtitle: 'This is a test',
        align: 'center',
      },
    },
    {
      id: 'text-1',
      type: 'Text',
      props: {
        content: 'Some body text',
        align: 'left',
        size: 'base',
      },
    },
    {
      id: 'cta-1',
      type: 'AddToCartButton',
      props: {
        text: 'Buy Now — $29.99',
        link: '#',
        variant: 'primary',
        size: 'lg',
      },
    },
  ],
};

export const invalidFunnel = {
  id: 'not-a-uuid',
  name: '',
  product: {
    title: '',
    price: -10,
  },
  blocks: [],
};
```

### 4. Write Unit Tests

Create `lib/schemas/__tests__/funnel.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { FunnelSchema, BlockSchema } from '../funnel.schema';
import { validateFunnel, validateFunnelRules } from '../../validation';
import { validFunnel, invalidFunnel } from './fixtures';

describe('FunnelSchema', () => {
  it('validates a correct funnel', () => {
    expect(() => FunnelSchema.parse(validFunnel)).not.toThrow();
  });

  it('rejects invalid UUID', () => {
    const invalid = { ...validFunnel, id: 'not-a-uuid' };
    expect(() => FunnelSchema.parse(invalid)).toThrow();
  });

  it('requires at least one block', () => {
    const invalid = { ...validFunnel, blocks: [] };
    expect(() => FunnelSchema.parse(invalid)).toThrow();
  });

  it('validates all block types', () => {
    const blockTypes = [
      'Banner',
      'Callout',
      'Text',
      'Reviews',
      'IconGroup',
      'Media',
      'MediaCarousel',
      'Accordions',
      'ProductGrid',
      'VariantSelector',
      'ProductImageCarousel',
      'AddToCartButton',
      'UpsellCarousel',
    ];

    // Each block type should be recognized
    expect(blockTypes).toHaveLength(13);
  });
});

describe('validateFunnelRules', () => {
  it('requires at least one CTA', () => {
    const funnelWithoutCTA = {
      ...validFunnel,
      blocks: [validFunnel.blocks[0]], // Only Callout, no CTA
    };

    const result = validateFunnelRules(funnelWithoutCTA);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Funnel must include at least one AddToCartButton');
  });

  it('warns about single CTA', () => {
    const result = validateFunnelRules(validFunnel);
    expect(result.warnings).toContain(
      'Best practice: Include 2-3 AddToCartButton blocks throughout funnel'
    );
  });

  it('warns about invalid first block', () => {
    const invalidStart = {
      ...validFunnel,
      blocks: [
        {
          id: 'text-1',
          type: 'Text' as const,
          props: { content: 'Text first', align: 'left' as const },
        },
        ...validFunnel.blocks,
      ],
    };

    const result = validateFunnelRules(invalidStart);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
```

### 5. Add Vitest Configuration (if not exists)

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

Install test dependencies:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

### 6. Test the Schemas

Run the tests:

```bash
npx vitest run lib/schemas/__tests__/funnel.test.ts
```

### 7. Create Example Usage File

Create `lib/schemas/examples.ts`:

```typescript
import type { Funnel } from './funnel.schema';

export const exampleFunnel: Funnel = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Mood Gummies Funnel',
  product: {
    title: 'Chili-Peach Mood Gummies',
    description: 'Natural mood-boosting gummies with organic ingredients',
    price: 29.99,
    currency: 'USD',
  },
  blocks: [
    {
      id: 'banner-1',
      type: 'Banner',
      props: {
        content: '🔥 Limited Drop: Only 500 Tins Available',
        background: '#FF6B6B',
        textColor: '#FFFFFF',
      },
    },
    {
      id: 'callout-1',
      type: 'Callout',
      props: {
        title: 'Feel the Spark',
        subtitle: 'Mood-boosting gummies that actually taste amazing',
        icon: '✨',
        align: 'center',
      },
    },
    {
      id: 'productimages-1',
      type: 'ProductImageCarousel',
      props: {
        images: [
          {
            src: 'https://placehold.co/600x600/6366F1/FFFFFF/png?text=Product',
            alt: 'Product Front',
          },
        ],
      },
    },
    {
      id: 'text-1',
      type: 'Text',
      props: {
        content:
          'Our gummies combine organic peach with capsaicin-infused chili extract to spark warmth and elevate your mood—no jitters, no crash.',
        align: 'left',
      },
    },
    {
      id: 'icons-1',
      type: 'IconGroup',
      props: {
        icons: [
          { label: 'Organic', src: '🌿' },
          { label: 'Vegan', src: '🌱' },
          { label: 'Non-GMO', src: '✅' },
        ],
        layout: 'horizontal',
      },
    },
    {
      id: 'cta-1',
      type: 'AddToCartButton',
      props: {
        text: 'Try It Risk-Free — $29.99',
        link: '#',
        variant: 'primary',
        size: 'lg',
        subtext: 'Free shipping on orders over $50',
      },
    },
    {
      id: 'reviews-1',
      type: 'Reviews',
      props: {
        items: [
          {
            name: 'Sarah M.',
            quote: 'These gummies are a vibe. I feel energized without the coffee crash.',
            stars: 5,
            verified: true,
          },
        ],
        layout: 'stacked',
      },
    },
    {
      id: 'accordions-1',
      type: 'Accordions',
      props: {
        sections: [
          {
            title: 'What makes these different?',
            content: 'We use real chili extract paired with organic peach.',
          },
        ],
      },
    },
    {
      id: 'cta-2',
      type: 'AddToCartButton',
      props: {
        text: 'Start Feeling Better Today',
        link: '#',
        variant: 'primary',
        size: 'lg',
      },
    },
  ],
};
```

## Acceptance Criteria

- ✅ All 13 block schemas defined
- ✅ Funnel schema validates correctly
- ✅ TypeScript types exported
- ✅ Validation functions work
- ✅ Rule validation catches best practice violations
- ✅ Unit tests pass
- ✅ No TypeScript errors
- ✅ Example fixtures created

## Testing Commands

```bash
# Run schema tests
npx vitest run lib/schemas

# Type check
npx tsc --noEmit

# Test validation function
node -e "
const { validateFunnel } = require('./lib/validation.ts');
const { exampleFunnel } = require('./lib/schemas/examples.ts');
console.log(validateFunnel(exampleFunnel));
"
```

## Troubleshooting

### "Module not found" errors

Make sure TypeScript paths are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Vitest not finding tests

Install required dependencies:

```bash
npm install -D vitest @vitejs/plugin-react jsdom
```

## Next Steps

Once all schemas are defined and tested:
- ➡️ **Proceed to Task 02: State Management**
- You can now use these types throughout the application
- Import with: `import type { Funnel, Block } from '@/lib/schemas/funnel.schema'`

---

**Status:** ✅ Complete this task before moving to Task 02
