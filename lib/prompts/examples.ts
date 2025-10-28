/**
 * Example AI output for sleep gummies
 */
export const exampleSleepGummiesResponse = `
Here's a high-converting funnel for your organic sleep gummies:

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
      }
    ]
  }
}
\`\`\`
`;

/**
 * Example iteration: add urgency banner
 */
export const exampleIterationAddBanner = `
User: "Add an urgency banner at the top"

Assistant response:
\`\`\`json
{
  "funnel": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dream Ease Sleep Gummies",
    "product": {...},
    "blocks": [
      {
        "id": "banner-urgent",
        "type": "Banner",
        "props": {
          "content": "⚡ Flash Sale: 48 Hours Only",
          "background": "#EF4444",
          "textColor": "#FFFFFF"
        }
      },
      // ... existing blocks
    ]
  }
}
\`\`\`
`;
