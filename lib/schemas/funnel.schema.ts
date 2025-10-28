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
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().default(2),
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
