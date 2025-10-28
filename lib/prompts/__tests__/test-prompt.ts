import Anthropic from '@anthropic-ai/sdk';
import { FUNNEL_BUILDER_SYSTEM_PROMPT } from '../funnel-builder';
import { validateFunnel } from '@/lib/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TestCase {
  name: string;
  userMessage: string;
  expectedBlocks?: string[];
  shouldContain?: string[];
}

const testCases: TestCase[] = [
  {
    name: 'Basic product funnel',
    userMessage: 'Make a funnel for organic sleep gummies with melatonin',
    expectedBlocks: ['Callout', 'AddToCartButton', 'Reviews'],
    shouldContain: ['sleep', 'melatonin'],
  },
  {
    name: 'Compliance test - medical claims',
    userMessage: 'Make a funnel for gummies that cure insomnia',
    shouldContain: ['support', 'promote', 'help'],
  },
  {
    name: 'Multiple CTAs',
    userMessage: 'Make a funnel for workout supplements with 3 CTAs',
    expectedBlocks: ['AddToCartButton'],
  },
];

async function testPrompt(testCase: TestCase): Promise<boolean> {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`   Input: "${testCase.userMessage}"`);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: FUNNEL_BUILDER_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: testCase.userMessage,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      console.error('   ❌ No text content in response');
      return false;
    }

    const content = firstBlock.text;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
      console.error('   ❌ No JSON found in response');
      return false;
    }

    const parsed = JSON.parse(jsonMatch[1]);
    const funnel = validateFunnel(parsed.funnel);

    console.log(`   ✅ Valid funnel generated`);
    console.log(`   📦 Blocks: ${funnel.blocks.length}`);
    console.log(`   🏷️  Types: ${funnel.blocks.map((b) => b.type).join(', ')}`);

    // Check expected blocks
    if (testCase.expectedBlocks) {
      const hasExpected = testCase.expectedBlocks.every((type) =>
        funnel.blocks.some((b) => b.type === type)
      );
      if (!hasExpected) {
        console.error(`   ⚠️  Missing expected blocks: ${testCase.expectedBlocks.join(', ')}`);
        return false;
      }
    }

    // Check content contains keywords
    if (testCase.shouldContain) {
      const contentStr = JSON.stringify(funnel).toLowerCase();
      const hasKeywords = testCase.shouldContain.every((keyword) =>
        contentStr.includes(keyword.toLowerCase())
      );
      if (!hasKeywords) {
        console.error(`   ⚠️  Missing keywords: ${testCase.shouldContain.join(', ')}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Running prompt tests...\n');

  const results = await Promise.all(testCases.map(testPrompt));
  const passed = results.filter(Boolean).length;

  console.log(`\n📊 Results: ${passed}/${testCases.length} passed`);

  if (passed === testCases.length) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests();
