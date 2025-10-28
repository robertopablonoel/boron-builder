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
        zoomEnabled: false,
      },
    },
    {
      id: 'text-1',
      type: 'Text',
      props: {
        content:
          'Our gummies combine organic peach with capsaicin-infused chili extract to spark warmth and elevate your mood—no jitters, no crash.',
        align: 'left',
        size: 'base',
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
