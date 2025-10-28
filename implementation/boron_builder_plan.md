# Boron Builder — MVP Implementation Plan

**Version:** 1.0
**Target:** Chat-driven eCommerce funnel builder MVP
**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind, Zustand, Claude AI

---

## 1. Executive Summary

Boron Builder is a conversational landing page builder optimized for DTC eCommerce funnels. Users describe their product in chat, and an AI agent returns a structured JSON representation of a high-converting funnel composed entirely of prebuilt blocks. The frontend renders this JSON in real-time as a mobile-first preview.

**Core Value Props:**
- Zero design or coding required
- Instant iteration via natural language
- Ad-safe, compliance-aware copy generation
- Mobile-optimized, conversion-focused layouts

**Scope (MVP):**
- Chat interface powered by Claude 3.5 Sonnet
- JSON-based funnel schema with ~12 block types
- Live preview renderer with mobile/desktop toggle
- LocalStorage persistence (no backend)
- Copy iteration and block reordering via chat

**Out of Scope:**
- Payment processing or checkout flows
- Domain hosting or publishing
- Analytics integrations
- A/B testing infrastructure
- Multi-page funnels (single-page only)

---

## 2. Architecture Overview

### 2.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      BORON BUILDER APP                       │
├──────────────────────────┬──────────────────────────────────┤
│   CHAT PANE              │       PREVIEW PANE               │
│                          │                                  │
│  ┌────────────────┐      │   ┌──────────────────────────┐  │
│  │ Message Thread │      │   │   Device Frame Toggle    │  │
│  │                │      │   │   [Mobile] [Desktop]     │  │
│  │ User: "Make    │      │   └──────────────────────────┘  │
│  │  a funnel..."  │      │                                  │
│  │                │      │   ┌──────────────────────────┐  │
│  │ AI: (thinking) │      │   │   Funnel Renderer        │  │
│  │                │      │   │                          │  │
│  │ AI: Here's your│◄─────┼───│   ┌──────────────────┐   │  │
│  │  funnel...     │      │   │   │ Banner Block     │   │  │
│  │                │      │   │   ├──────────────────┤   │  │
│  └────────────────┘      │   │   │ ProductCarousel  │   │  │
│         │                │   │   ├──────────────────┤   │  │
│         ▼                │   │   │ Reviews Block    │   │  │
│  ┌────────────────┐      │   │   ├──────────────────┤   │  │
│  │ Input Field    │      │   │   │ AddToCart CTA    │   │  │
│  │ "Add urgency   │      │   │   └──────────────────┘   │  │
│  │  banner..."    │      │   │                          │  │
│  └────────────────┘      │   └──────────────────────────┘  │
│                          │                                  │
└──────────────────────────┴──────────────────────────────────┘
           │                              ▲
           ▼                              │
    ┌─────────────┐              ┌────────────────┐
    │ Claude API  │              │  Zustand Store │
    │             │──JSON────────►│                │
    │ System      │  Schema      │ • messages[]   │
    │ Prompt +    │              │ • funnelJSON   │
    │ User Msg    │              │ • metadata     │
    └─────────────┘              └────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  LocalStorage   │
                                 │  Persistence    │
                                 └─────────────────┘
```

### 2.2 Component Responsibilities

| Layer | Component | Role |
|-------|-----------|------|
| **UI** | `ChatPane` | Message thread, input, streaming responses |
| **UI** | `PreviewPane` | Device frame, live funnel render |
| **Renderer** | `FunnelRenderer` | Maps JSON blocks → React components |
| **Renderer** | `Block/*` | Individual block components (Banner, Reviews, etc.) |
| **State** | `useChatStore` | Chat messages, AI streaming state |
| **State** | `useFunnelStore` | Current funnel JSON, metadata |
| **AI** | `generateFunnel()` | Calls Claude API with system prompt + user input |
| **Validation** | `funnelSchema` | Zod schema enforcing block contracts |

---

## 3. Data Flow

### 3.1 Initial Funnel Generation

```
User Input
   │
   ▼
"Make a funnel for chili-peach gummies..."
   │
   ▼
[Frontend] → POST /api/chat
   │          {
   │            systemPrompt: FUNNEL_BUILDER_PROMPT,
   │            userMessage: "...",
   │            conversationHistory: []
   │          }
   ▼
[Claude API] → Structured JSON response
   │
   ▼
{
  "funnel": {
    "id": "uuid-v4",
    "name": "Chili Peach Gummies",
    "blocks": [
      {
        "id": "block-1",
        "type": "Banner",
        "props": {
          "content": "🔥 Limited Drop: Only 500 Tins Left",
          "background": "#FF6B6B",
          "textColor": "#FFFFFF"
        }
      },
      {
        "id": "block-2",
        "type": "Callout",
        "props": {
          "title": "Feel the Spark",
          "subtitle": "Mood-boosting gummies that actually taste amazing",
          "icon": "✨"
        }
      },
      ...
    ]
  }
}
   │
   ▼
[Zod Validation] → funnelSchema.parse(response.funnel)
   │
   ▼
[Zustand Store] → setFunnelJSON(validatedFunnel)
   │
   ▼
[FunnelRenderer] → blocks.map(block => <BlockComponent {...block.props} />)
   │
   ▼
[Preview Pane] → Live render with mobile/desktop frame
```

### 3.2 Iteration Flow (User Edits)

```
User: "Add urgency banner at top"
   │
   ▼
[Frontend] → POST /api/chat
   │          {
   │            systemPrompt: FUNNEL_BUILDER_PROMPT,
   │            userMessage: "Add urgency banner at top",
   │            conversationHistory: [...],
   │            currentFunnel: { existing JSON }
   │          }
   ▼
[Claude API] → Returns UPDATED funnel JSON
   │           (with new Banner block inserted at index 0)
   ▼
[Zod Validation] → Re-validate entire funnel
   │
   ▼
[Zustand Store] → Replace funnelJSON
   │
   ▼
[Preview] → Auto-refresh with new block order
```

### 3.3 State Shape

```typescript
// useChatStore (Zustand)
interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setStreaming: (streaming: boolean) => void;
}

// useFunnelStore (Zustand)
interface FunnelStore {
  funnel: Funnel | null;
  metadata: {
    createdAt: string;
    lastModified: string;
    iterations: number;
  };
  setFunnel: (funnel: Funnel) => void;
  updateBlock: (blockId: string, props: any) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
}

// Core Types
interface Funnel {
  id: string;
  name: string;
  product: {
    title: string;
    description: string;
    price: number;
    currency: string;
  };
  blocks: Block[];
}

interface Block {
  id: string;
  type: BlockType;
  props: Record<string, any>;
}

type BlockType =
  | 'Banner'
  | 'Callout'
  | 'Text'
  | 'Reviews'
  | 'IconGroup'
  | 'Media'
  | 'MediaCarousel'
  | 'Accordions'
  | 'ProductGrid'
  | 'VariantSelector'
  | 'ProductImageCarousel'
  | 'AddToCartButton'
  | 'UpsellCarousel';
```

---

## 4. Block Library Specification

### 4.1 Block Type Reference

Each block has a strict prop contract validated via Zod. Below are the TypeScript interfaces and example JSON for each block.

#### **Banner**
**Purpose:** Urgency, promo codes, shipping announcements
**Usage:** Top of funnel, sticky headers

```typescript
interface BannerProps {
  content: string;
  background: string; // Hex or Tailwind color
  textColor: string;
  dismissible?: boolean;
}
```

```json
{
  "id": "banner-1",
  "type": "Banner",
  "props": {
    "content": "🚨 FLASH SALE: 25% Off Ends Tonight",
    "background": "#FF6B6B",
    "textColor": "#FFFFFF",
    "dismissible": false
  }
}
```

---

#### **Callout**
**Purpose:** Hero headline + subheadline
**Usage:** First impression, value prop

```typescript
interface CalloutProps {
  title: string;
  subtitle: string;
  icon?: string; // Emoji or icon URL
  align?: 'left' | 'center' | 'right';
}
```

```json
{
  "id": "callout-1",
  "type": "Callout",
  "props": {
    "title": "Feel the Spark",
    "subtitle": "Chili-Peach Gummies That Boost Mood & Connection",
    "icon": "✨",
    "align": "center"
  }
}
```

---

#### **Text**
**Purpose:** Body copy, storytelling, feature descriptions
**Usage:** Benefits, ingredients, usage instructions

```typescript
interface TextProps {
  content: string; // Markdown supported
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'base' | 'lg';
}
```

```json
{
  "id": "text-1",
  "type": "Text",
  "props": {
    "content": "Our gummies combine organic peach with capsaicin-infused chili extract to spark warmth and elevate your mood—no jitters, no crash.",
    "align": "left",
    "size": "base"
  }
}
```

---

#### **Reviews**
**Purpose:** Social proof via customer testimonials
**Usage:** Mid-funnel trust builder

```typescript
interface ReviewsProps {
  items: {
    name: string;
    quote: string;
    stars: number; // 1-5
    verified?: boolean;
  }[];
  layout?: 'stacked' | 'carousel';
}
```

```json
{
  "id": "reviews-1",
  "type": "Reviews",
  "props": {
    "items": [
      {
        "name": "Sarah M.",
        "quote": "These gummies are a vibe. I feel energized without the coffee crash.",
        "stars": 5,
        "verified": true
      },
      {
        "name": "Jordan T.",
        "quote": "Perfect for date night—subtle warmth, great taste.",
        "stars": 5
      }
    ],
    "layout": "stacked"
  }
}
```

---

#### **IconGroup**
**Purpose:** Feature highlights, trust badges, USPs
**Usage:** Below hero or above CTA

```typescript
interface IconGroupProps {
  icons: {
    label: string;
    src: string; // Emoji or icon URL
  }[];
  layout?: 'horizontal' | 'grid';
}
```

```json
{
  "id": "icongroup-1",
  "type": "IconGroup",
  "props": {
    "icons": [
      { "label": "Organic Ingredients", "src": "🌿" },
      { "label": "Vegan Friendly", "src": "🌱" },
      { "label": "No Artificial Colors", "src": "🚫" }
    ],
    "layout": "horizontal"
  }
}
```

---

#### **Media**
**Purpose:** Single image or video with caption
**Usage:** Product lifestyle shots, demo videos

```typescript
interface MediaProps {
  src: string; // Image or video URL
  alt?: string;
  caption?: string;
  type: 'image' | 'video';
}
```

```json
{
  "id": "media-1",
  "type": "Media",
  "props": {
    "src": "https://placekitten.com/800/600",
    "alt": "Chili-Peach Gummies in Hand",
    "caption": "Each tin contains 20 gummies—enough for 10 servings.",
    "type": "image"
  }
}
```

---

#### **MediaCarousel**
**Purpose:** Multiple images/videos in swipeable carousel
**Usage:** Product gallery, UGC showcase

```typescript
interface MediaCarouselProps {
  media: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  }[];
  autoplay?: boolean;
}
```

```json
{
  "id": "carousel-1",
  "type": "MediaCarousel",
  "props": {
    "media": [
      { "type": "image", "src": "https://placekitten.com/800/600", "alt": "Product 1" },
      { "type": "image", "src": "https://placekitten.com/801/600", "alt": "Product 2" },
      { "type": "video", "src": "https://example.com/demo.mp4" }
    ],
    "autoplay": false
  }
}
```

---

#### **Accordions**
**Purpose:** FAQ, ingredient lists, shipping details
**Usage:** Bottom of funnel, objection handling

```typescript
interface AccordionsProps {
  sections: {
    title: string;
    content: string; // Markdown supported
  }[];
}
```

```json
{
  "id": "accordions-1",
  "type": "Accordions",
  "props": {
    "sections": [
      {
        "title": "What makes these different from other gummies?",
        "content": "We use real chili extract (not synthetic capsaicin) paired with organic peach for a unique sensory experience."
      },
      {
        "title": "How many should I take?",
        "content": "Start with 1-2 gummies. Effects are subtle and build over 20-30 minutes."
      }
    ]
  }
}
```

---

#### **ProductGrid**
**Purpose:** Multi-product upsells or bundle displays
**Usage:** Cross-sells, variant tiers

```typescript
interface ProductGridProps {
  products: {
    title: string;
    image: string;
    price: number;
    url: string;
    badge?: string; // "Best Seller", "New", etc.
  }[];
  columns?: 2 | 3 | 4;
}
```

```json
{
  "id": "productgrid-1",
  "type": "ProductGrid",
  "props": {
    "products": [
      {
        "title": "Chili-Peach Gummies (Single)",
        "image": "https://placekitten.com/400/400",
        "price": 29.99,
        "url": "#",
        "badge": "Best Seller"
      },
      {
        "title": "Triple Pack Bundle",
        "image": "https://placekitten.com/401/400",
        "price": 79.99,
        "url": "#"
      }
    ],
    "columns": 2
  }
}
```

---

#### **VariantSelector**
**Purpose:** Size, flavor, or quantity picker
**Usage:** Inline before CTA

```typescript
interface VariantSelectorProps {
  label: string;
  options: {
    label: string; // "Single Tin", "3-Pack", etc.
    value: string;
    priceDiff?: number; // +/- from base price
    badge?: string; // "Save 20%"
  }[];
  defaultValue?: string;
}
```

```json
{
  "id": "variantselector-1",
  "type": "VariantSelector",
  "props": {
    "label": "Choose Your Pack",
    "options": [
      { "label": "Single Tin", "value": "single", "priceDiff": 0 },
      { "label": "3-Pack", "value": "3pack", "priceDiff": -10, "badge": "Save $10" },
      { "label": "6-Pack", "value": "6pack", "priceDiff": -30, "badge": "Best Value" }
    ],
    "defaultValue": "3pack"
  }
}
```

---

#### **ProductImageCarousel**
**Purpose:** Hero product images (packshots, lifestyle)
**Usage:** Top of funnel, primary visual anchor

```typescript
interface ProductImageCarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
  zoomEnabled?: boolean;
}
```

```json
{
  "id": "productimages-1",
  "type": "ProductImageCarousel",
  "props": {
    "images": [
      { "src": "https://placekitten.com/600/600", "alt": "Tin Front" },
      { "src": "https://placekitten.com/601/600", "alt": "Tin Back" },
      { "src": "https://placekitten.com/602/600", "alt": "Gummies Close-Up" }
    ],
    "zoomEnabled": true
  }
}
```

---

#### **AddToCartButton**
**Purpose:** Primary CTA for purchase
**Usage:** Repeated 2-3x in funnel (top, mid, bottom)

```typescript
interface AddToCartButtonProps {
  text: string;
  link: string; // Shopify /cart/add URL or similar
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  subtext?: string; // "Free shipping on orders $50+"
}
```

```json
{
  "id": "cta-1",
  "type": "AddToCartButton",
  "props": {
    "text": "Add to Cart — $29.99",
    "link": "#",
    "variant": "primary",
    "size": "lg",
    "subtext": "Free shipping on orders over $50"
  }
}
```

---

#### **UpsellCarousel**
**Purpose:** "Customers also bought" or bundle suggestions
**Usage:** Below primary CTA, post-purchase intent

```typescript
interface UpsellCarouselProps {
  title?: string;
  products: {
    title: string;
    image: string;
    price: number;
    url: string;
  }[];
}
```

```json
{
  "id": "upsell-1",
  "type": "UpsellCarousel",
  "props": {
    "title": "Complete Your Routine",
    "products": [
      {
        "title": "Lavender Sleep Gummies",
        "image": "https://placekitten.com/300/300",
        "price": 24.99,
        "url": "#"
      },
      {
        "title": "Focus Blend Capsules",
        "image": "https://placekitten.com/301/300",
        "price": 34.99,
        "url": "#"
      }
    ]
  }
}
```

---

### 4.2 Block Composition Rules

**Enforced by System Prompt:**

1. **Funnel must start with one of:** `Callout`, `Banner`, or `ProductImageCarousel`
2. **Every funnel must include at least one:** `AddToCartButton`
3. **Reviews block should appear:** After product benefits, before final CTA
4. **Accordions (FAQ) placement:** Bottom third of funnel
5. **CTA repetition:** Recommend 2-3 `AddToCartButton` blocks (top, mid, bottom)
6. **Mobile optimization:** All blocks responsive by default; no block exceeds 100vw

---

## 5. JSON Schema & Validation

### 5.1 Zod Schema Definition

```typescript
// lib/schemas/funnel.schema.ts
import { z } from 'zod';

// Individual block schemas
const BannerSchema = z.object({
  content: z.string().min(1),
  background: z.string(),
  textColor: z.string(),
  dismissible: z.boolean().optional(),
});

const CalloutSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  icon: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
});

const TextSchema = z.object({
  content: z.string().min(1),
  align: z.enum(['left', 'center', 'right']).optional(),
  size: z.enum(['sm', 'base', 'lg']).optional(),
});

const ReviewSchema = z.object({
  name: z.string(),
  quote: z.string(),
  stars: z.number().min(1).max(5),
  verified: z.boolean().optional(),
});

const ReviewsSchema = z.object({
  items: z.array(ReviewSchema).min(1),
  layout: z.enum(['stacked', 'carousel']).optional(),
});

const IconSchema = z.object({
  label: z.string(),
  src: z.string(),
});

const IconGroupSchema = z.object({
  icons: z.array(IconSchema).min(1),
  layout: z.enum(['horizontal', 'grid']).optional(),
});

const MediaSchema = z.object({
  src: z.string().url(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  type: z.enum(['image', 'video']),
});

const MediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  src: z.string().url(),
  alt: z.string().optional(),
});

const MediaCarouselSchema = z.object({
  media: z.array(MediaItemSchema).min(1),
  autoplay: z.boolean().optional(),
});

const AccordionSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const AccordionsSchema = z.object({
  sections: z.array(AccordionSectionSchema).min(1),
});

const ProductSchema = z.object({
  title: z.string(),
  image: z.string().url(),
  price: z.number().positive(),
  url: z.string(),
  badge: z.string().optional(),
});

const ProductGridSchema = z.object({
  products: z.array(ProductSchema).min(1),
  columns: z.enum([2, 3, 4]).optional(),
});

const VariantOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  priceDiff: z.number().optional(),
  badge: z.string().optional(),
});

const VariantSelectorSchema = z.object({
  label: z.string(),
  options: z.array(VariantOptionSchema).min(1),
  defaultValue: z.string().optional(),
});

const ProductImageSchema = z.object({
  src: z.string().url(),
  alt: z.string(),
});

const ProductImageCarouselSchema = z.object({
  images: z.array(ProductImageSchema).min(1),
  zoomEnabled: z.boolean().optional(),
});

const AddToCartButtonSchema = z.object({
  text: z.string().min(1),
  link: z.string(),
  variant: z.enum(['primary', 'secondary']).optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  subtext: z.string().optional(),
});

const UpsellCarouselSchema = z.object({
  title: z.string().optional(),
  products: z.array(ProductSchema).min(1),
});

// Discriminated union for all block types
const BlockSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string(), type: z.literal('Banner'), props: BannerSchema }),
  z.object({ id: z.string(), type: z.literal('Callout'), props: CalloutSchema }),
  z.object({ id: z.string(), type: z.literal('Text'), props: TextSchema }),
  z.object({ id: z.string(), type: z.literal('Reviews'), props: ReviewsSchema }),
  z.object({ id: z.string(), type: z.literal('IconGroup'), props: IconGroupSchema }),
  z.object({ id: z.string(), type: z.literal('Media'), props: MediaSchema }),
  z.object({ id: z.string(), type: z.literal('MediaCarousel'), props: MediaCarouselSchema }),
  z.object({ id: z.string(), type: z.literal('Accordions'), props: AccordionsSchema }),
  z.object({ id: z.string(), type: z.literal('ProductGrid'), props: ProductGridSchema }),
  z.object({ id: z.string(), type: z.literal('VariantSelector'), props: VariantSelectorSchema }),
  z.object({ id: z.string(), type: z.literal('ProductImageCarousel'), props: ProductImageCarouselSchema }),
  z.object({ id: z.string(), type: z.literal('AddToCartButton'), props: AddToCartButtonSchema }),
  z.object({ id: z.string(), type: z.literal('UpsellCarousel'), props: UpsellCarouselSchema }),
]);

// Root funnel schema
export const FunnelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  product: z.object({
    title: z.string().min(1),
    description: z.string(),
    price: z.number().positive(),
    currency: z.string().default('USD'),
  }),
  blocks: z.array(BlockSchema).min(1),
});

export type Funnel = z.infer<typeof FunnelSchema>;
export type Block = z.infer<typeof BlockSchema>;
```

### 5.2 Validation Flow

```typescript
// lib/validation.ts
import { FunnelSchema, type Funnel } from './schemas/funnel.schema';

export function validateFunnel(data: unknown): Funnel {
  const result = FunnelSchema.safeParse(data);

  if (!result.success) {
    console.error('Funnel validation failed:', result.error.flatten());
    throw new Error('Invalid funnel structure');
  }

  return result.data;
}

export function validateFunnelRules(funnel: Funnel): string[] {
  const errors: string[] = [];

  // Rule 1: Must have at least one AddToCartButton
  const hasCTA = funnel.blocks.some(b => b.type === 'AddToCartButton');
  if (!hasCTA) {
    errors.push('Funnel must include at least one AddToCartButton');
  }

  // Rule 2: First block should be Callout, Banner, or ProductImageCarousel
  const firstBlock = funnel.blocks[0];
  const validFirstBlocks = ['Callout', 'Banner', 'ProductImageCarousel'];
  if (!validFirstBlocks.includes(firstBlock.type)) {
    errors.push(`First block should be one of: ${validFirstBlocks.join(', ')}`);
  }

  // Rule 3: Recommend 2-3 CTAs
  const ctaCount = funnel.blocks.filter(b => b.type === 'AddToCartButton').length;
  if (ctaCount < 2) {
    errors.push('Best practice: Include 2-3 AddToCartButton blocks throughout funnel');
  }

  return errors;
}
```

---

## 6. System Prompt Design

### 6.1 Core Prompt Structure

```typescript
// lib/prompts/funnel-builder.ts
export const FUNNEL_BUILDER_SYSTEM_PROMPT = `
You are Boron Builder AI, an expert eCommerce funnel copywriter and conversion architect.

Your job is to generate high-converting, mobile-optimized landing page funnels for direct-to-consumer products. You output structured JSON that represents a single-page funnel composed of predefined blocks.

## YOUR CAPABILITIES

1. **Generate New Funnels**: When a user describes a product, you create a complete funnel JSON from scratch
2. **Iterate Funnels**: When a user requests changes, you modify the existing funnel JSON
3. **Optimize for Conversion**: You follow eCommerce best practices for layout, copy, and CTA placement
4. **Stay Compliant**: You avoid medical claims, guarantee language, and other ad-platform violations

## AVAILABLE BLOCKS

You may ONLY use these block types:

- **Banner**: Urgency, promo codes, announcements
- **Callout**: Hero headline + subtitle
- **Text**: Body copy, storytelling
- **Reviews**: Customer testimonials with star ratings
- **IconGroup**: Feature badges, trust signals
- **Media**: Single image or video
- **MediaCarousel**: Multiple images/videos
- **Accordions**: FAQ, ingredient lists
- **ProductGrid**: Multi-product upsells
- **VariantSelector**: Size/flavor/quantity picker
- **ProductImageCarousel**: Hero product images
- **AddToCartButton**: Primary CTA
- **UpsellCarousel**: "Customers also bought" suggestions

## FUNNEL STRUCTURE RULES

1. **Start with impact**: First block must be Callout, Banner, or ProductImageCarousel
2. **CTA placement**: Include 2-3 AddToCartButton blocks (top, middle, bottom)
3. **Social proof mid-funnel**: Place Reviews after benefits section
4. **FAQ at bottom**: Accordions should appear in bottom third
5. **Mobile-first**: All copy and blocks optimized for mobile readability

## COPY GUIDELINES

### DO:
- Use benefit-driven language ("Feel energized" vs "Contains 100mg caffeine")
- Create urgency without scarcity lies ("Limited drop" vs "Only 3 left!")
- Write conversationally, avoid corporate jargon
- Use sensory language for food/supplement products
- Include social proof in Reviews (real-sounding names, specific quotes)
- Frame CTAs with value ("Start feeling better — $29.99" vs "Buy Now")

### DON'T:
- Make medical claims ("cures anxiety" → "supports calm")
- Use absolute guarantees ("100% guaranteed" → "Try risk-free")
- Violate Meta/Google ad policies (research current guidelines)
- Use ALL CAPS excessively
- Create false scarcity
- Promise unrealistic results

## COMPLIANCE CHECKLIST (Supplements/Wellness)

- No disease treatment claims
- Use "supports," "promotes," "may help" instead of "cures," "treats," "fixes"
- Include standard disclaimers in Accordions if needed
- Avoid before/after imagery references
- Don't target minors for sensitive products

## OUTPUT FORMAT

Always respond with valid JSON in this structure:

\`\`\`json
{
  "funnel": {
    "id": "uuid-v4-string",
    "name": "Product Name",
    "product": {
      "title": "Product Name",
      "description": "Brief product description",
      "price": 29.99,
      "currency": "USD"
    },
    "blocks": [
      {
        "id": "unique-block-id",
        "type": "BlockType",
        "props": {
          // Block-specific props
        }
      }
    ]
  }
}
\`\`\`

## EXAMPLE FUNNEL

User: "Make a funnel for organic sleep gummies with melatonin and chamomile"

\`\`\`json
{
  "funnel": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dream Ease Sleep Gummies",
    "product": {
      "title": "Dream Ease Sleep Gummies",
      "description": "Organic melatonin + chamomile gummies for restful sleep",
      "price": 24.99,
      "currency": "USD"
    },
    "blocks": [
      {
        "id": "banner-1",
        "type": "Banner",
        "props": {
          "content": "🌙 New Customer Offer: 20% Off Your First Order",
          "background": "#4A5568",
          "textColor": "#FFFFFF"
        }
      },
      {
        "id": "callout-1",
        "type": "Callout",
        "props": {
          "title": "Finally, Sleep That Feels Natural",
          "subtitle": "Organic gummies with melatonin + chamomile—no grogginess, just rest",
          "icon": "✨",
          "align": "center"
        }
      },
      {
        "id": "productimages-1",
        "type": "ProductImageCarousel",
        "props": {
          "images": [
            { "src": "https://placehold.co/600x600/6366F1/FFFFFF/png?text=Bottle", "alt": "Dream Ease Bottle" },
            { "src": "https://placehold.co/600x600/8B5CF6/FFFFFF/png?text=Gummies", "alt": "Gummies Close-Up" }
          ]
        }
      },
      {
        "id": "text-1",
        "type": "Text",
        "props": {
          "content": "Each gummy combines 3mg of plant-based melatonin with chamomile extract to help you unwind naturally. No next-day fog, no dependency—just consistent, quality sleep.",
          "align": "left"
        }
      },
      {
        "id": "icongroup-1",
        "type": "IconGroup",
        "props": {
          "icons": [
            { "label": "USDA Organic", "src": "🌿" },
            { "label": "Vegan", "src": "🌱" },
            { "label": "Non-GMO", "src": "✅" }
          ],
          "layout": "horizontal"
        }
      },
      {
        "id": "cta-1",
        "type": "AddToCartButton",
        "props": {
          "text": "Try Dream Ease — $24.99",
          "link": "#",
          "variant": "primary",
          "size": "lg",
          "subtext": "30-day supply • Free shipping over $40"
        }
      },
      {
        "id": "reviews-1",
        "type": "Reviews",
        "props": {
          "items": [
            {
              "name": "Emily R.",
              "quote": "I fall asleep faster and wake up refreshed. No weird aftertaste either!",
              "stars": 5,
              "verified": true
            },
            {
              "name": "Marcus L.",
              "quote": "Finally found a sleep aid that doesn't make me feel groggy in the morning.",
              "stars": 5
            }
          ],
          "layout": "stacked"
        }
      },
      {
        "id": "accordions-1",
        "type": "Accordions",
        "props": {
          "sections": [
            {
              "title": "How many gummies should I take?",
              "content": "Start with 1 gummy 30 minutes before bed. You can increase to 2 if needed."
            },
            {
              "title": "Is this habit-forming?",
              "content": "No. Our melatonin dose is gentle and supports your natural sleep cycle without dependency."
            },
            {
              "title": "What's your return policy?",
              "content": "We offer a 30-day satisfaction guarantee. If you're not happy, we'll refund you—no questions asked."
            }
          ]
        }
      },
      {
        "id": "cta-2",
        "type": "AddToCartButton",
        "props": {
          "text": "Start Sleeping Better Tonight",
          "link": "#",
          "variant": "primary",
          "size": "lg"
        }
      }
    ]
  }
}
\`\`\`

## ITERATION BEHAVIOR

When the user says something like:
- "Add urgency banner" → Insert Banner block at top
- "Make hero more playful" → Update Callout copy tone
- "Swap reviews and FAQ" → Reorder blocks
- "Add variant selector for 3-pack" → Insert VariantSelector before first CTA

Always return the FULL updated funnel JSON, not just the changed blocks.

## TONE

- Professional but conversational
- Empathetic to customer pain points
- Confident without being pushy
- Mobile-friendly brevity (shorter paragraphs, punchier copy)

You are an expert at balancing persuasion with authenticity. Let's build high-converting funnels.
`;
```

### 6.2 Context Injection for Iterations

```typescript
// lib/ai/generate-funnel.ts
export async function generateFunnel(
  userMessage: string,
  conversationHistory: Message[],
  currentFunnel?: Funnel
): Promise<Funnel> {
  const messages = [
    {
      role: 'system',
      content: FUNNEL_BUILDER_SYSTEM_PROMPT,
    },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  // Inject current funnel if iterating
  if (currentFunnel) {
    messages.push({
      role: 'system',
      content: `Current funnel state:\n\`\`\`json\n${JSON.stringify(currentFunnel, null, 2)}\n\`\`\``,
    });
  }

  messages.push({
    role: 'user',
    content: userMessage,
  });

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages,
  });

  // Extract JSON from response
  const content = response.content[0].text;
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON');
  }

  const parsed = JSON.parse(jsonMatch[1]);
  return validateFunnel(parsed.funnel);
}
```

---

## 7. Frontend Architecture

### 7.1 Project Structure

```
boron/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Main builder UI
│   ├── api/
│   │   └── chat/
│   │       └── route.ts            # Claude API endpoint
│   └── globals.css
├── components/
│   ├── Builder/
│   │   ├── ChatPane.tsx            # Left pane: message thread + input
│   │   ├── PreviewPane.tsx         # Right pane: device frame + renderer
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── DeviceFrame.tsx         # Mobile/desktop toggle wrapper
│   ├── Renderer/
│   │   ├── FunnelRenderer.tsx      # Maps blocks[] → components
│   │   └── BlockRegistry.tsx       # Component lookup table
│   └── Blocks/
│       ├── Banner.tsx
│       ├── Callout.tsx
│       ├── Text.tsx
│       ├── Reviews.tsx
│       ├── IconGroup.tsx
│       ├── Media.tsx
│       ├── MediaCarousel.tsx
│       ├── Accordions.tsx
│       ├── ProductGrid.tsx
│       ├── VariantSelector.tsx
│       ├── ProductImageCarousel.tsx
│       ├── AddToCartButton.tsx
│       └── UpsellCarousel.tsx
├── lib/
│   ├── ai/
│   │   └── generate-funnel.ts      # Claude API wrapper
│   ├── schemas/
│   │   └── funnel.schema.ts        # Zod schemas
│   ├── prompts/
│   │   └── funnel-builder.ts       # System prompt
│   ├── validation.ts
│   └── store/
│       ├── chat-store.ts           # Zustand: chat state
│       └── funnel-store.ts         # Zustand: funnel JSON + metadata
├── public/
│   └── placeholder-images/         # Default product images
├── .env.local                      # ANTHROPIC_API_KEY
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 7.2 Main Page Layout

```typescript
// app/page.tsx
'use client';

import { ChatPane } from '@/components/Builder/ChatPane';
import { PreviewPane } from '@/components/Builder/PreviewPane';

export default function BuilderPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Chat Pane - Left */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        <ChatPane />
      </div>

      {/* Preview Pane - Right */}
      <div className="w-1/2 flex flex-col">
        <PreviewPane />
      </div>
    </div>
  );
}
```

---

## 8. State Management (Zustand)

### 8.1 Chat Store

```typescript
// lib/store/chat-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (role: Message['role'], content: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,

      addMessage: (role, content) => {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              role,
              content,
              timestamp: Date.now(),
            },
          ],
        }));
      },

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'boron-chat-storage',
    }
  )
);
```

### 8.2 Funnel Store

```typescript
// lib/store/funnel-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Funnel, Block } from '@/lib/schemas/funnel.schema';

interface FunnelState {
  funnel: Funnel | null;
  metadata: {
    createdAt: string | null;
    lastModified: string | null;
    iterations: number;
  };
  setFunnel: (funnel: Funnel) => void;
  updateBlock: (blockId: string, props: Record<string, any>) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  clearFunnel: () => void;
}

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
      funnel: null,
      metadata: {
        createdAt: null,
        lastModified: null,
        iterations: 0,
      },

      setFunnel: (funnel) => {
        set((state) => ({
          funnel,
          metadata: {
            createdAt: state.metadata.createdAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
            iterations: state.metadata.iterations + 1,
          },
        }));
      },

      updateBlock: (blockId, props) => {
        set((state) => {
          if (!state.funnel) return state;

          const updatedBlocks = state.funnel.blocks.map((block) =>
            block.id === blockId
              ? { ...block, props: { ...block.props, ...props } }
              : block
          );

          return {
            funnel: { ...state.funnel, blocks: updatedBlocks },
            metadata: {
              ...state.metadata,
              lastModified: new Date().toISOString(),
            },
          };
        });
      },

      reorderBlocks: (fromIndex, toIndex) => {
        set((state) => {
          if (!state.funnel) return state;

          const blocks = [...state.funnel.blocks];
          const [removed] = blocks.splice(fromIndex, 1);
          blocks.splice(toIndex, 0, removed);

          return {
            funnel: { ...state.funnel, blocks },
            metadata: {
              ...state.metadata,
              lastModified: new Date().toISOString(),
            },
          };
        });
      },

      clearFunnel: () => {
        set({
          funnel: null,
          metadata: {
            createdAt: null,
            lastModified: null,
            iterations: 0,
          },
        });
      },
    }),
    {
      name: 'boron-funnel-storage',
    }
  )
);
```

---

## 9. Component Implementation

### 9.1 ChatPane

```typescript
// components/Builder/ChatPane.tsx
'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { useFunnelStore } from '@/lib/store/funnel-store';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatPane() {
  const { messages, addMessage, setStreaming, isStreaming } = useChatStore();
  const { funnel, setFunnel } = useFunnelStore();
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Add user message
    addMessage('user', content);
    setStreaming(true);
    setError(null);

    try {
      // Call API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages,
          currentFunnel: funnel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate funnel');
      }

      const data = await response.json();

      // Add AI response
      addMessage('assistant', data.message);

      // Update funnel if returned
      if (data.funnel) {
        setFunnel(data.funnel);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      addMessage('system', `Error: ${errorMsg}`);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Boron Builder</h1>
        <p className="text-sm text-gray-600">
          Describe your product to generate a funnel
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isStreaming={isStreaming} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={
            funnel
              ? 'Refine your funnel...'
              : 'Describe your product (e.g., "chili-peach gummies that boost mood")'
          }
        />
      </div>
    </div>
  );
}
```

### 9.2 MessageInput

```typescript
// components/Builder/MessageInput.tsx
'use client';

import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 flex gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={2}
        className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  );
}
```

### 9.3 PreviewPane

```typescript
// components/Builder/PreviewPane.tsx
'use client';

import { useState } from 'react';
import { useFunnelStore } from '@/lib/store/funnel-store';
import { FunnelRenderer } from '../Renderer/FunnelRenderer';
import { DeviceFrame } from './DeviceFrame';

type DeviceMode = 'mobile' | 'desktop';

export function PreviewPane() {
  const { funnel } = useFunnelStore();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>

        {/* Device Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mobile
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Desktop
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
        {funnel ? (
          <DeviceFrame mode={deviceMode}>
            <FunnelRenderer funnel={funnel} />
          </DeviceFrame>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">No funnel yet</p>
            <p className="text-sm mt-1">
              Describe your product in the chat to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 9.4 FunnelRenderer

```typescript
// components/Renderer/FunnelRenderer.tsx
import type { Funnel } from '@/lib/schemas/funnel.schema';
import { BlockRegistry } from './BlockRegistry';

interface FunnelRendererProps {
  funnel: Funnel;
}

export function FunnelRenderer({ funnel }: FunnelRendererProps) {
  return (
    <div className="w-full min-h-screen bg-white">
      {funnel.blocks.map((block) => {
        const Component = BlockRegistry[block.type];

        if (!Component) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }

        return (
          <div key={block.id} data-block-id={block.id}>
            <Component {...block.props} />
          </div>
        );
      })}
    </div>
  );
}
```

### 9.5 BlockRegistry

```typescript
// components/Renderer/BlockRegistry.tsx
import { Banner } from '../Blocks/Banner';
import { Callout } from '../Blocks/Callout';
import { Text } from '../Blocks/Text';
import { Reviews } from '../Blocks/Reviews';
import { IconGroup } from '../Blocks/IconGroup';
import { Media } from '../Blocks/Media';
import { MediaCarousel } from '../Blocks/MediaCarousel';
import { Accordions } from '../Blocks/Accordions';
import { ProductGrid } from '../Blocks/ProductGrid';
import { VariantSelector } from '../Blocks/VariantSelector';
import { ProductImageCarousel } from '../Blocks/ProductImageCarousel';
import { AddToCartButton } from '../Blocks/AddToCartButton';
import { UpsellCarousel } from '../Blocks/UpsellCarousel';

export const BlockRegistry: Record<string, React.ComponentType<any>> = {
  Banner,
  Callout,
  Text,
  Reviews,
  IconGroup,
  Media,
  MediaCarousel,
  Accordions,
  ProductGrid,
  VariantSelector,
  ProductImageCarousel,
  AddToCartButton,
  UpsellCarousel,
};
```

### 9.6 Example Block Components

#### Banner

```typescript
// components/Blocks/Banner.tsx
interface BannerProps {
  content: string;
  background: string;
  textColor: string;
  dismissible?: boolean;
}

export function Banner({
  content,
  background,
  textColor,
  dismissible = false,
}: BannerProps) {
  return (
    <div
      className="w-full py-3 px-4 text-center font-medium text-sm"
      style={{ backgroundColor: background, color: textColor }}
    >
      {content}
    </div>
  );
}
```

#### Callout

```typescript
// components/Blocks/Callout.tsx
interface CalloutProps {
  title: string;
  subtitle: string;
  icon?: string;
  align?: 'left' | 'center' | 'right';
}

export function Callout({
  title,
  subtitle,
  icon,
  align = 'center',
}: CalloutProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div className={`py-12 px-6 ${alignClass}`}>
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        {title}
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}
```

#### AddToCartButton

```typescript
// components/Blocks/AddToCartButton.tsx
interface AddToCartButtonProps {
  text: string;
  link: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  subtext?: string;
}

export function AddToCartButton({
  text,
  link,
  variant = 'primary',
  size = 'lg',
  subtext,
}: AddToCartButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  }[variant];

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  }[size];

  return (
    <div className="py-8 px-6 text-center">
      <a
        href={link}
        className={`inline-block font-bold rounded-lg transition-colors ${variantClasses} ${sizeClasses}`}
      >
        {text}
      </a>
      {subtext && (
        <p className="mt-3 text-sm text-gray-600">{subtext}</p>
      )}
    </div>
  );
}
```

#### Reviews

```typescript
// components/Blocks/Reviews.tsx
interface Review {
  name: string;
  quote: string;
  stars: number;
  verified?: boolean;
}

interface ReviewsProps {
  items: Review[];
  layout?: 'stacked' | 'carousel';
}

export function Reviews({ items, layout = 'stacked' }: ReviewsProps) {
  return (
    <div className="py-12 px-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-8">
        What Customers Say
      </h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {items.map((review, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-yellow-400">
                {'★'.repeat(review.stars)}
                {'☆'.repeat(5 - review.stars)}
              </div>
              {review.verified && (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-700 italic mb-3">"{review.quote}"</p>
            <p className="text-sm font-medium text-gray-900">
              — {review.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. API Route

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FUNNEL_BUILDER_SYSTEM_PROMPT } from '@/lib/prompts/funnel-builder';
import { validateFunnel } from '@/lib/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, currentFunnel } = await req.json();

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ];

    // Inject current funnel context if iterating
    if (currentFunnel) {
      messages.push({
        role: 'user',
        content: `Current funnel:\n\`\`\`json\n${JSON.stringify(
          currentFunnel,
          null,
          2
        )}\n\`\`\`\n\n${message}`,
      });
    } else {
      messages.push({
        role: 'user',
        content: message,
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: FUNNEL_BUILDER_SYSTEM_PROMPT,
      messages,
    });

    const content = response.content[0].text;

    // Extract JSON from markdown code fence
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
      return NextResponse.json({
        message: content,
        funnel: null,
      });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    const validatedFunnel = validateFunnel(parsed.funnel);

    return NextResponse.json({
      message: content,
      funnel: validatedFunnel,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate funnel' },
      { status: 500 }
    );
  }
}
```

---

## 11. Development Phases

### Phase 1: Foundation (16-20 hours)

**Milestone:** Working chat interface + API integration

| Task | Hours |
|------|-------|
| Next.js project setup, Tailwind config | 2 |
| Zustand stores (chat + funnel) | 3 |
| Zod schema definitions for all blocks | 4 |
| System prompt engineering + testing | 4 |
| API route + Anthropic integration | 3 |
| LocalStorage persistence | 2 |
| Error handling + validation | 2 |

**Deliverable:** User can type a product description, get back valid JSON, and see it logged in console.

---

### Phase 2: Block Library (20-24 hours)

**Milestone:** All 13 block components rendered correctly

| Task | Hours |
|------|-------|
| BlockRegistry + FunnelRenderer setup | 2 |
| Implement core blocks (Banner, Callout, Text) | 3 |
| Implement ecom blocks (ProductGrid, VariantSelector, AddToCartButton) | 5 |
| Implement media blocks (Media, Carousels) | 4 |
| Implement social proof (Reviews, IconGroup) | 3 |
| Implement Accordions | 2 |
| Responsive styling (mobile-first) | 4 |
| Block prop validation in renderer | 1 |

**Deliverable:** All block types render correctly from JSON.

---

### Phase 3: UI/UX Polish (12-16 hours)

**Milestone:** Production-ready builder interface

| Task | Hours |
|------|-------|
| ChatPane layout + message styling | 4 |
| PreviewPane with device frame toggle | 3 |
| Loading states + streaming indicators | 3 |
| Empty states (no funnel, no messages) | 2 |
| Error handling UI (toast/banner) | 2 |
| Mobile responsiveness for builder UI | 3 |

**Deliverable:** Clean, professional interface ready for user testing.

---

### Phase 4: Iteration Features (8-12 hours)

**Milestone:** User can edit funnels via chat commands

| Task | Hours |
|------|-------|
| Conversation history management | 2 |
| Context injection for iterations | 3 |
| Block reordering via chat | 2 |
| Copy tone adjustments (test prompts) | 3 |
| Undo/redo support (stretch) | 2 |

**Deliverable:** Users can refine funnels through natural language.

---

### Phase 5: Testing & Optimization (8-10 hours)

**Milestone:** Bug-free MVP ready for internal demo

| Task | Hours |
|------|-------|
| Unit tests for schemas + validation | 3 |
| E2E tests for chat → render flow | 4 |
| Performance optimization (lazy load blocks) | 2 |
| Accessibility audit (ARIA, keyboard nav) | 1 |

**Deliverable:** Stable, tested MVP.

---

**Total Estimated Hours:** 64-82 hours
**Timeline (solo dev):** 2-3 weeks at 30-40 hrs/week
**Timeline (team of 2):** 1-2 weeks

---

## 12. Ecom-Specific Considerations

### 12.1 Conversion Hierarchy

Funnels should follow proven eCommerce psychology:

1. **Attention** (Hero): Callout or ProductImageCarousel
2. **Interest** (Benefits): Text, IconGroup
3. **Desire** (Social Proof): Reviews, Media
4. **Action** (CTA): AddToCartButton (repeated)
5. **Reassurance** (FAQ): Accordions
6. **Final Push** (CTA): AddToCartButton

**AI Prompt Guidance:**
System prompt should enforce this flow by default, but allow user overrides.

---

### 12.2 CTA Best Practices

- **Placement:** Top (impulse buy), middle (after benefits), bottom (after FAQ)
- **Copy:** Value-driven ("Start Feeling Better — $29") vs transactional ("Buy Now")
- **Subtext:** Free shipping thresholds, guarantees, payment options
- **Contrast:** Primary CTAs use brand color, secondary CTAs muted

**Component Logic:**

```typescript
// AddToCartButton should support urgency props
interface AddToCartButtonProps {
  text: string;
  link: string;
  variant?: 'primary' | 'secondary';
  urgency?: string; // "Only 3 left!" or "Sale ends in 2h"
}
```

---

### 12.3 Compliance & Ad Safety

**Meta/Google Policy Violations to Avoid:**

- Medical claims ("cures," "treats," "prevents")
- Before/after transformations (imply results)
- Absolute guarantees ("100% guaranteed to work")
- Targeting minors for age-restricted products
- Misleading scarcity ("Only 1 left" when false)

**AI Prompt Enforcement:**

```typescript
// Add compliance checker in system prompt
const COMPLIANCE_RULES = `
## COMPLIANCE CHECKLIST

Before returning JSON, verify:
- [ ] No disease treatment claims
- [ ] Use "supports," "promotes," "may help" language
- [ ] No false scarcity (timers, stock counts)
- [ ] No before/after imagery references
- [ ] Age-appropriate targeting language
`;
```

**Post-Generation Linting (Stretch Goal):**

```typescript
// lib/compliance-linter.ts
export function lintFunnelCopy(funnel: Funnel): string[] {
  const warnings: string[] = [];
  const flaggedTerms = ['cures', 'guaranteed', '100%', 'miracle'];

  funnel.blocks.forEach((block) => {
    const copyFields = Object.values(block.props).filter(
      (v) => typeof v === 'string'
    );

    copyFields.forEach((copy) => {
      flaggedTerms.forEach((term) => {
        if (copy.toLowerCase().includes(term)) {
          warnings.push(`⚠️  Block ${block.id}: Contains "${term}"`);
        }
      });
    });
  });

  return warnings;
}
```

---

### 12.4 Mobile Optimization

**80% of DTC traffic is mobile.** All blocks must:

- Use responsive Tailwind classes (`text-4xl md:text-5xl`)
- Avoid fixed widths; use `max-w-*` constraints
- Touch targets ≥44px for buttons
- Lazy load images below fold
- Support swipe gestures for carousels

**DeviceFrame Component:**

```typescript
// components/Builder/DeviceFrame.tsx
export function DeviceFrame({
  mode,
  children,
}: {
  mode: 'mobile' | 'desktop';
  children: React.ReactNode;
}) {
  const width = mode === 'mobile' ? 'max-w-[375px]' : 'max-w-[1200px]';

  return (
    <div
      className={`${width} mx-auto bg-white shadow-2xl rounded-lg overflow-hidden`}
    >
      {mode === 'mobile' && (
        <div className="h-6 bg-gray-900 flex items-center justify-center gap-2">
          <div className="w-16 h-1 bg-gray-700 rounded-full" />
        </div>
      )}
      <div className="overflow-y-auto" style={{ height: mode === 'mobile' ? '667px' : 'auto' }}>
        {children}
      </div>
    </div>
  );
}
```

---

### 12.5 Offer Framing

**Upsell Psychology:**

- Single product → Good
- 3-pack → Better (highlight savings)
- 6-pack → Best (badge "Most Popular")

**VariantSelector Implementation:**

```typescript
// AI should auto-generate tiered pricing
{
  "type": "VariantSelector",
  "props": {
    "label": "Choose Your Pack",
    "options": [
      { "label": "1 Bottle", "value": "1", "priceDiff": 0 },
      { "label": "3 Bottles", "value": "3", "priceDiff": -15, "badge": "Save $15" },
      { "label": "6 Bottles", "value": "6", "priceDiff": -40, "badge": "Best Value" }
    ]
  }
}
```

---

## 13. Stretch Goals (Post-MVP)

### 13.1 Multi-Product Funnels

**Use Case:** Bundle pages, cross-sells

**Schema Extension:**

```typescript
interface Funnel {
  id: string;
  name: string;
  products: Product[]; // Array instead of single product
  blocks: Block[];
}
```

**AI Prompt Update:**
Allow user to say: "Add lavender sleep gummies as a cross-sell"

---

### 13.2 Compliance Linting Dashboard

**Feature:** Real-time warnings for flagged copy

**UI:**
Sidebar panel showing:
- ⚠️  Banner block contains "guaranteed"
- ⚠️  Callout uses medical claim language

**Implementation:**

```typescript
// Run linter after each AI response
const warnings = lintFunnelCopy(validatedFunnel);

// Display in UI
{warnings.length > 0 && (
  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
    <h3 className="font-bold text-yellow-800">Compliance Warnings</h3>
    <ul className="mt-2 text-sm text-yellow-700">
      {warnings.map((w, i) => (
        <li key={i}>{w}</li>
      ))}
    </ul>
  </div>
)}
```

---

### 13.3 Export & Publishing

**Export Options:**

1. **HTML Download:** Render funnel as static HTML + inline CSS
2. **Shopify Liquid:** Convert blocks to Shopify theme sections
3. **JSON Export:** Download funnel JSON for external renderers

**Implementation:**

```typescript
// lib/export/html-exporter.ts
export function exportAsHTML(funnel: Funnel): string {
  const blocksHTML = funnel.blocks.map((block) => {
    // Server-render each block component to HTML string
    return renderToStaticMarkup(<BlockRegistry[block.type] {...block.props} />);
  }).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${funnel.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ${blocksHTML}
</body>
</html>
  `;
}
```

---

### 13.4 A/B Test Variants

**Use Case:** Generate 2-3 variations of headlines, CTAs

**Chat Command:**
User: "Generate 3 headline variations for the callout"

**AI Response:**

```json
{
  "variants": [
    { "id": "v1", "title": "Feel the Spark" },
    { "id": "v2", "title": "Ignite Your Mood" },
    { "id": "v3", "title": "Unleash Your Energy" }
  ]
}
```

**UI:** Radio buttons to select variant, re-render preview instantly

---

### 13.5 Analytics Integration

**Track:**

- Click-through rate on CTAs
- Scroll depth
- Time on page
- Device type split

**Implementation:**
Inject tracking pixels into blocks (Google Analytics, Meta Pixel, etc.)

```typescript
// components/Blocks/AddToCartButton.tsx
<button
  onClick={() => {
    // Track CTA click
    if (window.gtag) {
      window.gtag('event', 'add_to_cart_click', {
        funnel_id: funnelId,
        block_id: blockId,
      });
    }
  }}
>
  {text}
</button>
```

---

### 13.6 Image Generation Integration

**Feature:** Auto-generate product images via DALL-E or Midjourney API

**Prompt:**
User: "Generate hero image for chili-peach gummies"

**AI Workflow:**

1. Generate DALL-E prompt internally
2. Call image API
3. Return image URL in JSON

**Schema Update:**

```typescript
// AI can now generate placeholder URLs or real images
{
  "type": "ProductImageCarousel",
  "props": {
    "images": [
      { "src": "https://dalle-generated-url.png", "alt": "Gummies" }
    ]
  }
}
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

**Tools:** Vitest, React Testing Library

```typescript
// __tests__/schemas/funnel.test.ts
import { describe, it, expect } from 'vitest';
import { FunnelSchema } from '@/lib/schemas/funnel.schema';

describe('FunnelSchema', () => {
  it('validates a correct funnel', () => {
    const validFunnel = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Funnel',
      product: {
        title: 'Test Product',
        description: 'A test product',
        price: 29.99,
        currency: 'USD',
      },
      blocks: [
        {
          id: 'block-1',
          type: 'Callout',
          props: {
            title: 'Test',
            subtitle: 'Subtitle',
          },
        },
      ],
    };

    expect(() => FunnelSchema.parse(validFunnel)).not.toThrow();
  });

  it('rejects invalid block type', () => {
    const invalidFunnel = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test',
      product: { title: 'Test', description: 'Test', price: 10, currency: 'USD' },
      blocks: [
        {
          id: 'block-1',
          type: 'InvalidBlock',
          props: {},
        },
      ],
    };

    expect(() => FunnelSchema.parse(invalidFunnel)).toThrow();
  });
});
```

---

### 14.2 Component Tests

```typescript
// __tests__/components/Banner.test.tsx
import { render, screen } from '@testing-library/react';
import { Banner } from '@/components/Blocks/Banner';

describe('Banner', () => {
  it('renders content with correct styles', () => {
    render(
      <Banner
        content="Test Banner"
        background="#FF0000"
        textColor="#FFFFFF"
      />
    );

    const banner = screen.getByText('Test Banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveStyle({ backgroundColor: '#FF0000', color: '#FFFFFF' });
  });
});
```

---

### 14.3 E2E Tests

**Tools:** Playwright

```typescript
// e2e/funnel-generation.spec.ts
import { test, expect } from '@playwright/test';

test('generates funnel from chat input', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Type product description
  await page.fill('textarea[placeholder*="Describe your product"]',
    'Chili-peach gummies that boost mood'
  );
  await page.click('button:has-text("Send")');

  // Wait for AI response
  await page.waitForSelector('[data-block-id]', { timeout: 15000 });

  // Verify blocks rendered
  const blocks = await page.locator('[data-block-id]').count();
  expect(blocks).toBeGreaterThan(0);

  // Verify Callout block exists
  const callout = await page.locator('h1').first();
  expect(await callout.textContent()).toBeTruthy();
});
```

---

## 15. Performance Considerations

### 15.1 Optimization Techniques

| Strategy | Implementation |
|----------|----------------|
| **Code Splitting** | Dynamic import for block components: `const Banner = dynamic(() => import('./Blocks/Banner'))` |
| **Image Lazy Loading** | `<img loading="lazy" />` for Media blocks |
| **Debounce Chat Input** | Prevent API spam on rapid typing |
| **Memoization** | `React.memo()` for static blocks |
| **LocalStorage Throttling** | Only persist every 2s, not on every state change |

---

### 15.2 Bundle Size Targets

- **Initial JS:** < 150kb (gzipped)
- **Total Page Weight:** < 500kb (excluding user images)
- **Lighthouse Score:** > 90 (Performance)

**Tooling:**

```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

---

## 16. Deployment Checklist

### 16.1 Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...

# .env.production
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=https://boron-builder.vercel.app
```

---

### 16.2 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add ANTHROPIC_API_KEY
```

---

### 16.3 Pre-Launch Audit

- [ ] All blocks render correctly on mobile Safari
- [ ] API rate limiting implemented (prevent abuse)
- [ ] Error boundaries for block render failures
- [ ] Analytics tracking (PostHog, Plausible, etc.)
- [ ] Compliance linter warnings tested
- [ ] LocalStorage cleared on browser close (privacy)
- [ ] Accessibility: Keyboard navigation, screen reader support
- [ ] Legal: Privacy policy, ToS (if collecting data)

---

## 17. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| **Time to First Funnel** | < 30 seconds from input to preview |
| **Funnel Generation Success Rate** | > 95% (valid JSON) |
| **Mobile Render Performance** | < 2s TTI (Time to Interactive) |
| **User Iteration Count** | Avg 3-5 chat commands per funnel |
| **Block Variety** | Avg 6-8 blocks per funnel |

---

## 18. Next Steps After MVP

1. **User Testing:** 10 marketers/founders try builder, gather feedback
2. **Prompt Refinement:** Iterate system prompt based on output quality
3. **Block Library Expansion:** Add Video, Countdown Timer, Live Chat widgets
4. **Multi-Page Support:** Upsell pages, thank-you pages
5. **Template Library:** Pre-built funnels by category (supplements, fashion, SaaS)
6. **Integrations:** Shopify, WooCommerce, Stripe Checkout
7. **Collaboration:** Share funnels via link, team workspaces

---

## 19. Technical Debt to Address Post-MVP

- **API Key Security:** Move to server-side only (no client exposure)
- **Rate Limiting:** Implement per-user quotas
- **Database Migration:** Move from LocalStorage to Supabase/Postgres
- **Authentication:** Add user accounts (Clerk, Auth0)
- **Block Versioning:** Track changes for undo/redo
- **Real-time Collaboration:** Multi-user editing (Yjs, PartyKit)

---

## 20. Appendix: Key Files Checklist

```
✅ app/page.tsx                     # Main UI
✅ app/api/chat/route.ts            # Claude API endpoint
✅ components/Builder/ChatPane.tsx
✅ components/Builder/PreviewPane.tsx
✅ components/Renderer/FunnelRenderer.tsx
✅ components/Renderer/BlockRegistry.tsx
✅ components/Blocks/*.tsx          # 13 block components
✅ lib/store/chat-store.ts
✅ lib/store/funnel-store.ts
✅ lib/schemas/funnel.schema.ts
✅ lib/prompts/funnel-builder.ts
✅ lib/validation.ts
✅ lib/compliance-linter.ts (stretch)
✅ tailwind.config.ts
✅ .env.local
✅ package.json
```

---

## 21. Final Notes

**Boron Builder is designed for speed.** The MVP focuses on:

1. **Instant feedback** (chat → preview in <5s)
2. **Zero learning curve** (natural language, no UI training)
3. **Conversion best practices baked in** (AI knows eCommerce)

**Not trying to replace Figma or Webflow.** This is a specialized tool for DTC marketers who need landing pages NOW, not in 3 days.

**The moat is the prompt.** The system prompt is the product. Invest 20% of dev time iterating on prompt quality vs 80% on UI polish.

**Ship fast, iterate faster.** Get MVP in front of 10 real users within 2 weeks. Let their funnels guide v2.

---

**End of Implementation Plan**
**Version:** 1.0
**Last Updated:** 2025-10-27
