import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FunnelRenderer } from '../FunnelRenderer';
import { BlockRegistry } from '../BlockRegistry';
import type { Funnel } from '@/lib/schemas/funnel.schema';

describe('BlockRegistry', () => {
  it('exports all block components', () => {
    const expectedBlocks = [
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

    expectedBlocks.forEach((blockType) => {
      expect(BlockRegistry[blockType]).toBeDefined();
      expect(typeof BlockRegistry[blockType]).toBe('function');
    });
  });

  it('has correct number of block types', () => {
    expect(Object.keys(BlockRegistry).length).toBe(13);
  });
});

describe('FunnelRenderer', () => {
  const mockFunnel: Funnel = {
    id: '550e8400-e29b-41d4-a716-446655440000',
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
        type: 'Banner',
        props: {
          content: 'Test Banner',
          background: '#FF0000',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'block-2',
        type: 'Callout',
        props: {
          title: 'Test Title',
          subtitle: 'Test Subtitle',
          align: 'center',
        },
      },
      {
        id: 'block-3',
        type: 'Text',
        props: {
          content: 'Test content paragraph',
          align: 'left' as const,
          size: 'base' as const,
        },
      },
    ],
  };

  it('renders all blocks from funnel', () => {
    render(<FunnelRenderer funnel={mockFunnel} />);

    expect(screen.getByText('Test Banner')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content paragraph')).toBeInTheDocument();
  });

  it('applies data attributes to block wrappers', () => {
    const { container } = render(<FunnelRenderer funnel={mockFunnel} />);

    const block1 = container.querySelector('[data-block-id="block-1"]');
    expect(block1).toBeInTheDocument();
    expect(block1).toHaveAttribute('data-block-type', 'Banner');

    const block2 = container.querySelector('[data-block-id="block-2"]');
    expect(block2).toBeInTheDocument();
    expect(block2).toHaveAttribute('data-block-type', 'Callout');
  });

  it('renders blocks in correct order', () => {
    const { container } = render(<FunnelRenderer funnel={mockFunnel} />);

    const blocks = container.querySelectorAll('[data-block-id]');
    expect(blocks.length).toBe(3);
    expect(blocks[0]).toHaveAttribute('data-block-id', 'block-1');
    expect(blocks[1]).toHaveAttribute('data-block-id', 'block-2');
    expect(blocks[2]).toHaveAttribute('data-block-id', 'block-3');
  });

  it('handles unknown block types gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const funnelWithUnknownBlock: Funnel = {
      ...mockFunnel,
      blocks: [
        {
          id: 'unknown-block',
          type: 'UnknownBlockType' as any,
          props: {} as any,
        },
      ],
    };

    render(<FunnelRenderer funnel={funnelWithUnknownBlock} />);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown block type: UnknownBlockType');
    expect(screen.getByText('Unknown block type: UnknownBlockType')).toBeInTheDocument();
    expect(screen.getByText(/Block ID: unknown-block/)).toBeInTheDocument();

    consoleWarnSpy.mockRestore();
  });

  it('renders empty funnel without errors', () => {
    const emptyFunnel: Funnel = {
      ...mockFunnel,
      blocks: [],
    };

    const { container } = render(<FunnelRenderer funnel={emptyFunnel} />);

    const blocks = container.querySelectorAll('[data-block-id]');
    expect(blocks.length).toBe(0);
  });

  it('renders all block types correctly', () => {
    const comprehensiveFunnel: Funnel = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Comprehensive Test Funnel',
      product: {
        title: 'Test Product',
        description: 'Testing all blocks',
        price: 49.99,
        currency: 'USD',
      },
      blocks: [
        {
          id: 'banner-test',
          type: 'Banner',
          props: { content: 'Banner Test', background: '#000', textColor: '#FFF' },
        },
        {
          id: 'callout-test',
          type: 'Callout',
          props: { title: 'Callout Test', subtitle: 'Subtitle', align: 'center' as const },
        },
        {
          id: 'text-test',
          type: 'Text',
          props: { content: 'Text Test', align: 'left' as const, size: 'base' as const },
        },
        {
          id: 'reviews-test',
          type: 'Reviews',
          props: {
            items: [
              { name: 'Test User', quote: 'Great!', stars: 5 },
            ],
            layout: 'stacked' as const,
          },
        },
        {
          id: 'icongroup-test',
          type: 'IconGroup',
          props: {
            icons: [{ label: 'Test Icon', src: '✓' }],
            layout: 'horizontal' as const,
          },
        },
        {
          id: 'media-test',
          type: 'Media',
          props: { src: 'https://example.com/img.jpg', type: 'image' as const },
        },
        {
          id: 'mediacarousel-test',
          type: 'MediaCarousel',
          props: {
            media: [
              { type: 'image' as const, src: 'https://example.com/img1.jpg' },
            ],
            autoplay: false,
          },
        },
        {
          id: 'accordions-test',
          type: 'Accordions',
          props: {
            sections: [{ title: 'Question', content: 'Answer' }],
          },
        },
        {
          id: 'productgrid-test',
          type: 'ProductGrid',
          props: {
            products: [
              {
                title: 'Product',
                image: 'https://example.com/product.jpg',
                price: 29.99,
                url: '#',
              },
            ],
            columns: 2 as const,
          },
        },
        {
          id: 'variantselector-test',
          type: 'VariantSelector',
          props: {
            label: 'Size',
            options: [{ label: 'Small', value: 'sm' }],
          },
        },
        {
          id: 'productimages-test',
          type: 'ProductImageCarousel',
          props: {
            images: [{ src: 'https://example.com/img.jpg', alt: 'Product' }],
            zoomEnabled: false,
          },
        },
        {
          id: 'addtocart-test',
          type: 'AddToCartButton',
          props: { text: 'Add to Cart', link: '#', variant: 'primary' as const, size: 'lg' as const },
        },
        {
          id: 'upsell-test',
          type: 'UpsellCarousel',
          props: {
            products: [
              {
                title: 'Upsell',
                image: 'https://example.com/upsell.jpg',
                price: 19.99,
                url: '#',
              },
            ],
          },
        },
      ],
    };

    const { container } = render(<FunnelRenderer funnel={comprehensiveFunnel} />);

    const blocks = container.querySelectorAll('[data-block-id]');
    expect(blocks.length).toBe(13);

    // Verify each block type is present
    expect(screen.getByText('Banner Test')).toBeInTheDocument();
    expect(screen.getByText('Callout Test')).toBeInTheDocument();
    expect(screen.getByText('Text Test')).toBeInTheDocument();
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
    expect(screen.getByText('Test Icon')).toBeInTheDocument();
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Add to Cart/ })).toBeInTheDocument();
    expect(screen.getByText('Upsell')).toBeInTheDocument();
  });

  it('passes props correctly to block components', () => {
    render(<FunnelRenderer funnel={mockFunnel} />);

    const banner = screen.getByText('Test Banner');
    expect(banner).toHaveStyle({
      backgroundColor: 'rgb(255, 0, 0)',
      color: 'rgb(255, 255, 255)',
    });
  });

  it('renders with proper container classes', () => {
    const { container } = render(<FunnelRenderer funnel={mockFunnel} />);

    const rendererContainer = container.firstChild;
    expect(rendererContainer).toHaveClass('w-full', 'min-h-screen', 'bg-white');
  });
});
