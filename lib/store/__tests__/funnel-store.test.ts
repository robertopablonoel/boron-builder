import { describe, it, expect, beforeEach } from 'vitest';
import { useFunnelStore } from '../funnel-store';
import type { Funnel } from '@/lib/schemas/funnel.schema';

const mockFunnel: Funnel = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Funnel',
  product: {
    title: 'Test Product',
    description: 'Test description',
    price: 29.99,
    currency: 'USD',
  },
  blocks: [
    {
      id: 'block-1',
      type: 'Callout',
      props: {
        title: 'Test',
        subtitle: 'Test subtitle',
        align: 'center',
      },
    },
    {
      id: 'block-2',
      type: 'Text',
      props: {
        content: 'Test content',
        align: 'left',
        size: 'base',
      },
    },
  ],
};

describe('FunnelStore', () => {
  beforeEach(() => {
    useFunnelStore.setState({
      funnel: null,
      metadata: {
        createdAt: null,
        lastModified: null,
        iterations: 0,
      },
    });
  });

  it('sets funnel correctly', () => {
    const { setFunnel } = useFunnelStore.getState();

    setFunnel(mockFunnel);

    const { funnel } = useFunnelStore.getState();
    expect(funnel).toEqual(mockFunnel);
  });

  it('updates block props', () => {
    const { setFunnel, updateBlock } = useFunnelStore.getState();

    setFunnel(mockFunnel);
    updateBlock('block-1', { title: 'Updated Title' });

    const { funnel } = useFunnelStore.getState();
    const block = funnel?.blocks.find((b) => b.id === 'block-1');
    if (block?.type === 'Callout') {
      expect(block.props.title).toBe('Updated Title');
    }
  });

  it('deletes blocks', () => {
    const { setFunnel, deleteBlock } = useFunnelStore.getState();

    setFunnel(mockFunnel);
    deleteBlock('block-1');

    const { funnel } = useFunnelStore.getState();
    expect(funnel?.blocks).toHaveLength(1);
    expect(funnel?.blocks[0].id).toBe('block-2');
  });

  it('reorders blocks', () => {
    const { setFunnel, reorderBlocks } = useFunnelStore.getState();

    setFunnel(mockFunnel);
    reorderBlocks(0, 1);

    const { funnel } = useFunnelStore.getState();
    expect(funnel?.blocks[0].id).toBe('block-2');
    expect(funnel?.blocks[1].id).toBe('block-1');
  });

  it('tracks metadata changes', () => {
    const { setFunnel } = useFunnelStore.getState();

    setFunnel(mockFunnel);

    const { metadata } = useFunnelStore.getState();
    expect(metadata.createdAt).toBeTruthy();
    expect(metadata.lastModified).toBeTruthy();
    expect(metadata.iterations).toBe(1);
  });
});
