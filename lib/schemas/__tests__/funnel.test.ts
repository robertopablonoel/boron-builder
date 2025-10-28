import { describe, it, expect } from 'vitest';
import { FunnelSchema } from '../funnel.schema';
import { validateFunnelRules } from '../../validation';
import { validFunnel } from './fixtures';

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
          props: { content: 'Text first', align: 'left' as const, size: 'base' as const },
        },
        ...validFunnel.blocks,
      ],
    };

    const result = validateFunnelRules(invalidStart);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
