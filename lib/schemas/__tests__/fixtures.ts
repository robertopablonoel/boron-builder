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
