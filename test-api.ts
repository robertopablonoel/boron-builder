// Run: npx tsx test-api.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testAPI() {
  console.log('Testing Anthropic API...');

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: 'Say "API connection successful!"',
      },
    ],
  });

  const firstBlock = response.content[0];
  if (firstBlock.type === 'text') {
    console.log('Response:', firstBlock.text);
  }
}

testAPI().catch(console.error);
