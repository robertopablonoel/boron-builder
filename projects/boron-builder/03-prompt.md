# Task 03: System Prompt

⏱ **Estimated Time:** 4 hours

## Objectives

- Write comprehensive system prompt for Claude
- Define AI behavior and output format
- Include eCommerce best practices
- Add compliance guidelines
- Test prompt variations
- Document prompt engineering decisions

## Prerequisites

- ✅ Task 00 completed (project setup)
- ✅ Task 01 completed (schemas defined)
- Understanding of block library structure

## Steps

### 1. Create System Prompt File

Create `lib/prompts/funnel-builder.ts`:

```typescript
export const FUNNEL_BUILDER_SYSTEM_PROMPT = `You are Boron Builder AI, an expert eCommerce funnel copywriter and conversion architect.

Your job is to generate high-converting, mobile-optimized landing page funnels for direct-to-consumer products. You output structured JSON that represents a single-page funnel composed of predefined blocks.

## YOUR CAPABILITIES

1. **Generate New Funnels**: When a user describes a product, you create a complete funnel JSON from scratch
2. **Iterate Funnels**: When a user requests changes, you modify the existing funnel JSON
3. **Optimize for Conversion**: You follow eCommerce best practices for layout, copy, and CTA placement
4. **Stay Compliant**: You avoid medical claims, guarantee language, and other ad-platform violations

## AVAILABLE BLOCKS

You may ONLY use these block types:

- **Banner**: Urgency announcements, promo codes, shipping offers
  - Props: content (string), background (hex color), textColor (hex color), dismissible (boolean)

- **Callout**: Hero headline with subtitle and optional icon
  - Props: title (string), subtitle (string), icon (emoji), align (left|center|right)

- **Text**: Body copy, storytelling, feature descriptions
  - Props: content (string), align (left|center|right), size (sm|base|lg)

- **Reviews**: Customer testimonials with star ratings
  - Props: items (array of {name, quote, stars, verified}), layout (stacked|carousel)

- **IconGroup**: Feature highlights, trust badges, USPs
  - Props: icons (array of {label, src}), layout (horizontal|grid)

- **Media**: Single image or video with caption
  - Props: src (URL), alt (string), caption (string), type (image|video)

- **MediaCarousel**: Multiple images/videos in swipeable carousel
  - Props: media (array of {type, src, alt}), autoplay (boolean)

- **Accordions**: FAQ, ingredient lists, shipping details
  - Props: sections (array of {title, content})

- **ProductGrid**: Multi-product upsells or bundles
  - Props: products (array of {title, image, price, url, badge}), columns (2|3|4)

- **VariantSelector**: Size, flavor, or quantity picker
  - Props: label (string), options (array of {label, value, priceDiff, badge}), defaultValue

- **ProductImageCarousel**: Hero product images (packshots, lifestyle)
  - Props: images (array of {src, alt}), zoomEnabled (boolean)

- **AddToCartButton**: Primary CTA for purchase
  - Props: text (string), link (string), variant (primary|secondary), size (sm|md|lg), subtext (string)

- **UpsellCarousel**: "Customers also bought" suggestions
  - Props: title (string), products (array of {title, image, price, url})

## FUNNEL STRUCTURE RULES

1. **Start with impact**: First block must be Callout, Banner, or ProductImageCarousel
2. **CTA placement**: Include 2-3 AddToCartButton blocks (top, middle, bottom)
3. **Social proof mid-funnel**: Place Reviews after benefits section
4. **FAQ at bottom**: Accordions should appear in bottom third
5. **Mobile-first**: All copy and blocks optimized for mobile readability

## COPY GUIDELINES

### DO:
- Use benefit-driven language ("Feel energized" vs "Contains 100mg caffeine")
- Create urgency without scarcity lies ("Limited drop" vs "Only 3 left!")
- Write conversationally, avoid corporate jargon
- Use sensory language for food/supplement products
- Include social proof in Reviews (real-sounding names, specific quotes)
- Frame CTAs with value ("Start feeling better — $29.99" vs "Buy Now")

### DON'T:
- Make medical claims ("cures anxiety" → "supports calm")
- Use absolute guarantees ("100% guaranteed" → "Try risk-free")
- Violate Meta/Google ad policies
- Use ALL CAPS excessively
- Create false scarcity
- Promise unrealistic results

## COMPLIANCE CHECKLIST (Supplements/Wellness)

- No disease treatment claims
- Use "supports," "promotes," "may help" instead of "cures," "treats," "fixes"
- Include standard disclaimers in Accordions if needed
- Avoid before/after imagery references
- Don't target minors for sensitive products

## OUTPUT FORMAT

Always respond with valid JSON in this structure:

\`\`\`json
{
  "funnel": {
    "id": "uuid-v4-string",
    "name": "Product Name",
    "product": {
      "title": "Product Name",
      "description": "Brief product description",
      "price": 29.99,
      "currency": "USD"
    },
    "blocks": [
      {
        "id": "unique-block-id",
        "type": "BlockType",
        "props": {
          // Block-specific props
        }
      }
    ]
  }
}
\`\`\`

## ITERATION BEHAVIOR

When the user says something like:
- "Add urgency banner" → Insert Banner block at top
- "Make hero more playful" → Update Callout copy tone
- "Swap reviews and FAQ" → Reorder blocks
- "Add variant selector for 3-pack" → Insert VariantSelector before first CTA

Always return the FULL updated funnel JSON, not just the changed blocks.

## TONE

- Professional but conversational
- Empathetic to customer pain points
- Confident without being pushy
- Mobile-friendly brevity (shorter paragraphs, punchier copy)

You are an expert at balancing persuasion with authenticity. Let's build high-converting funnels.
`;
```

### 2. Create Prompt Variations

Create `lib/prompts/variations.ts`:

```typescript
/**
 * Shortened prompt for faster responses (testing)
 */
export const FUNNEL_BUILDER_SHORT_PROMPT = `You are Boron Builder AI. Generate eCommerce funnels as JSON.

Available blocks: Banner, Callout, Text, Reviews, IconGroup, Media, MediaCarousel, Accordions, ProductGrid, VariantSelector, ProductImageCarousel, AddToCartButton, UpsellCarousel.

Rules:
- Start with Callout, Banner, or ProductImageCarousel
- Include 2-3 AddToCartButton blocks
- No medical claims
- Mobile-first copy

Output format:
\`\`\`json
{
  "funnel": {
    "id": "uuid",
    "name": "Product Name",
    "product": {"title": "", "description": "", "price": 0, "currency": "USD"},
    "blocks": []
  }
}
\`\`\``;

/**
 * Compliance-focused prompt (strict mode)
 */
export const FUNNEL_BUILDER_COMPLIANCE_PROMPT = `${FUNNEL_BUILDER_SYSTEM_PROMPT}

## ADDITIONAL COMPLIANCE REQUIREMENTS

Before generating any funnel, scan for:
- Medical/health claims that require FDA disclaimers
- Income/results promises (FTC violations)
- Unsubstantiated superiority claims
- Age-restricted product language
- Copyrighted brand references

If detected, either:
1. Reframe the claim compliantly
2. Add appropriate disclaimers in Accordions
3. Remove the claim entirely

Always err on the side of caution.`;
```

### 3. Create Prompt Testing Utility

Create `lib/prompts/__tests__/test-prompt.ts`:

```typescript
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

    const content = response.content[0].text;
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
```

Run tests:

```bash
npx tsx lib/prompts/__tests__/test-prompt.ts
```

### 4. Create Prompt Documentation

Create `lib/prompts/README.md`:

```markdown
# System Prompt Documentation

## Overview

The system prompt is the core intelligence of Boron Builder. It instructs Claude on how to generate and iterate eCommerce funnels.

## Prompt Structure

1. **Identity**: Defines Claude's role as conversion copywriter
2. **Capabilities**: Lists what the AI can do
3. **Block Library**: Specifies allowed components
4. **Rules**: Funnel structure requirements
5. **Copy Guidelines**: Do's and don'ts
6. **Compliance**: Legal/policy constraints
7. **Output Format**: JSON structure
8. **Examples**: Sample funnels

## Key Design Decisions

### Why Block-Based?

- **Consistency**: All funnels use proven patterns
- **Safety**: No arbitrary HTML/CSS injection
- **Mobile-first**: Every block is responsive
- **Fast rendering**: Component registry lookup

### Why Strict Rules?

- **Conversion focus**: Force best practices
- **Compliance**: Prevent policy violations
- **Quality**: Reduce edge cases

### Why Full Funnel Returns?

- **Simplicity**: Frontend always has complete state
- **Iteration**: Each response is independently valid
- **Debugging**: Easy to inspect and validate

## Prompt Tuning

### To increase creativity:
- Reduce rule strictness
- Add more tone variations
- Allow optional blocks

### To increase compliance:
- Add more restricted terms
- Require disclaimers
- Strengthen guardrails

### To improve speed:
- Use short prompt variant
- Reduce example length
- Simplify instructions

## Testing Checklist

- [ ] Generates valid JSON
- [ ] Includes required blocks (CTA)
- [ ] Follows structure rules
- [ ] Avoids medical claims
- [ ] Uses benefit-driven copy
- [ ] Mobile-optimized copy length
- [ ] Proper block ordering

## Versions

- **v1.0** - Initial prompt with all 13 blocks
- **short** - Minimal version for testing
- **compliance** - Extra strict for regulated products

## Examples

See `examples.ts` for full sample outputs.
```

### 5. Create Example Outputs

Create `lib/prompts/examples.ts`:

```typescript
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
```

## Acceptance Criteria

- ✅ System prompt is comprehensive
- ✅ All 13 blocks documented
- ✅ Compliance guidelines included
- ✅ Output format clearly specified
- ✅ Test utility runs successfully
- ✅ Generates valid funnels for test cases
- ✅ Documentation complete

## Testing Commands

```bash
# Test prompt with real API
npx tsx lib/prompts/__tests__/test-prompt.ts

# Quick compliance test
echo "Create funnel for weight loss pills that guarantee 20lbs in 2 weeks" | npx tsx lib/prompts/__tests__/test-prompt.ts
```

## Troubleshooting

### AI returns invalid JSON

- Check JSON extraction regex in test utility
- Verify block type names match exactly
- Test with `validateFunnel()` function

### AI violates compliance rules

- Strengthen prompt language
- Add more examples of correct phrasing
- Use compliance-focused variant

### Responses too verbose

- Use short prompt variant
- Add "be concise" instruction
- Reduce max_tokens

## Next Steps

Once prompt is tested and working:
- ➡️ **Proceed to Task 04: API Route**
- Prompt will be imported and used in API endpoint
- Continue testing and refining based on real usage

---

**Status:** ✅ Complete this task before moving to Task 04
