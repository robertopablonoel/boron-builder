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
