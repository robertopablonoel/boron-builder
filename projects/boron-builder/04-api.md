# Task 04: API Route

⏱ **Estimated Time:** 3 hours

## Objectives

- Create Next.js API route for Claude integration
- Handle chat requests with conversation history
- Extract and validate JSON responses
- Implement error handling
- Add rate limiting (basic)
- Test API endpoint

## Prerequisites

- ✅ Task 00 completed (project setup)
- ✅ Task 01 completed (schemas)
- ✅ Task 02 completed (stores)
- ✅ Task 03 completed (system prompt)
- Anthropic API key configured

## Steps

### 1. Create API Route Handler

Create `app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FUNNEL_BUILDER_SYSTEM_PROMPT } from '@/lib/prompts/funnel-builder';
import { validateFunnel, validateFunnelRules } from '@/lib/validation';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Constants
const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 4096;
const MAX_CONVERSATION_LENGTH = 20; // Prevent token overflow

export async function POST(req: NextRequest) {
  console.log('📨 Chat API request received');

  try {
    // Parse request body
    const body = await req.json();
    const { message, conversationHistory = [], currentFunnel = null } = body;

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Truncate conversation history if too long
    const truncatedHistory = conversationHistory.slice(-MAX_CONVERSATION_LENGTH);

    // Build messages array
    const messages: Anthropic.MessageParam[] = truncatedHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Inject current funnel context if iterating
    let userMessage = message;
    if (currentFunnel) {
      userMessage = `Current funnel:\n\`\`\`json\n${JSON.stringify(
        currentFunnel,
        null,
        2
      )}\n\`\`\`\n\n${message}`;
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log('🤖 Calling Claude API...');
    console.log('   Model:', MODEL);
    console.log('   Message:', message.substring(0, 50) + '...');

    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: FUNNEL_BUILDER_SYSTEM_PROMPT,
      messages,
    });

    const content = response.content[0].text;
    console.log('✅ Response received');

    // Extract JSON from markdown code fence
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
      console.warn('⚠️  No JSON found in response');
      return NextResponse.json({
        message: content,
        funnel: null,
        warning: 'AI did not return a funnel. Try rephrasing your request.',
      });
    }

    // Parse and validate JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1]);
    } catch (error) {
      console.error('❌ JSON parse error:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in AI response' },
        { status: 500 }
      );
    }

    // Validate funnel schema
    const funnel = validateFunnel(parsed.funnel);
    console.log('✅ Funnel validated');
    console.log('   Name:', funnel.name);
    console.log('   Blocks:', funnel.blocks.length);

    // Check best practice rules
    const rules = validateFunnelRules(funnel);
    if (!rules.valid) {
      console.warn('⚠️  Funnel validation warnings:', rules.errors);
    }

    // Return success response
    return NextResponse.json({
      message: content,
      funnel,
      validation: {
        warnings: rules.warnings,
        errors: rules.errors,
      },
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error('❌ API Error:', error);

    // Handle Anthropic API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Check your ANTHROPIC_API_KEY environment variable.' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    if (error.status === 529) {
      return NextResponse.json(
        { error: 'Claude is currently overloaded. Please try again.' },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate funnel',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    model: MODEL,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  });
}
```

### 2. Create API Helper Functions

Create `lib/ai/chat-api.ts`:

```typescript
import type { Funnel } from '@/lib/schemas/funnel.schema';
import type { Message } from '@/lib/store/chat-store';

export interface ChatRequest {
  message: string;
  conversationHistory: Message[];
  currentFunnel?: Funnel | null;
}

export interface ChatResponse {
  message: string;
  funnel: Funnel | null;
  validation?: {
    warnings: string[];
    errors: string[];
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ChatError {
  error: string;
  details?: string;
}

/**
 * Call chat API endpoint
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ChatError = await response.json();
    throw new Error(error.error || 'Failed to generate funnel');
  }

  return response.json();
}

/**
 * Check API health
 */
export async function checkAPIHealth(): Promise<{
  status: string;
  model: string;
  hasApiKey: boolean;
}> {
  const response = await fetch('/api/chat');
  return response.json();
}
```

### 3. Create API Test Utility

Create `app/api/chat/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: async () => ({
        content: [
          {
            text: `Here's your funnel:
\`\`\`json
{
  "funnel": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Test Funnel",
    "product": {
      "title": "Test Product",
      "description": "Test",
      "price": 29.99,
      "currency": "USD"
    },
    "blocks": [
      {
        "id": "cta-1",
        "type": "AddToCartButton",
        "props": {
          "text": "Buy Now",
          "link": "#"
        }
      }
    ]
  }
}
\`\`\``,
          },
        ],
        usage: {
          input_tokens: 100,
          output_tokens: 200,
        },
      }),
    };
  },
}));

describe('Chat API Route', () => {
  it('GET returns health check', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.status).toBe('ok');
    expect(data.model).toBeDefined();
  });

  it('POST generates funnel', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Make a funnel for sleep gummies',
        conversationHistory: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.funnel).toBeDefined();
    expect(data.funnel.name).toBe('Test Funnel');
    expect(data.funnel.blocks.length).toBeGreaterThan(0);
  });

  it('POST validates input', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        // Missing message
        conversationHistory: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Message is required');
  });
});
```

### 4. Create Manual Test Script

Create `test-api.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Chat API..."
echo ""

# Check health endpoint
echo "1️⃣  Health Check:"
curl http://localhost:3000/api/chat
echo -e "\n"

# Test basic funnel generation
echo "2️⃣  Generate Funnel:"
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Make a funnel for organic sleep gummies with melatonin and chamomile",
    "conversationHistory": []
  }' | jq '.funnel.name, .funnel.blocks | length'
echo ""

# Test iteration
echo "3️⃣  Iterate Funnel (add banner):"
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add an urgency banner at the top",
    "conversationHistory": [
      {
        "id": "1",
        "role": "user",
        "content": "Make a funnel for sleep gummies",
        "timestamp": 1234567890
      }
    ],
    "currentFunnel": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Test",
      "product": {"title": "Test", "description": "Test", "price": 10, "currency": "USD"},
      "blocks": [{"id": "cta-1", "type": "AddToCartButton", "props": {"text": "Buy", "link": "#"}}]
    }
  }' | jq '.funnel.blocks[0].type'
echo ""

echo "✅ API tests complete!"
```

Make it executable:

```bash
chmod +x test-api.sh
```

Run tests:

```bash
# Start dev server first
npm run dev

# In another terminal:
./test-api.sh
```

### 5. Add Rate Limiting (Simple)

Create `lib/api/rate-limit.ts`:

```typescript
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Simple in-memory rate limiter
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = store[identifier];

  // No record or window expired
  if (!record || now > record.resetAt) {
    store[identifier] = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  // Increment count
  record.count++;

  if (record.count > MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    resetAt: record.resetAt,
  };
}
```

Add to route handler:

```typescript
// In app/api/chat/route.ts
import { checkRateLimit } from '@/lib/api/rate-limit';

export async function POST(req: NextRequest) {
  // Get IP for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        resetAt: rateLimit.resetAt,
      },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

### 6. Add Request Logging

Create `lib/api/logger.ts`:

```typescript
interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  message: string;
  responseTime: number;
  success: boolean;
}

const logs: RequestLog[] = [];
const MAX_LOGS = 100;

export function logRequest(log: RequestLog) {
  logs.unshift(log);
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = log.success ? '✅' : '❌';
    console.log(
      `${emoji} [${log.method}] ${log.path} - ${log.message} (${log.responseTime}ms)`
    );
  }
}

export function getLogs(): RequestLog[] {
  return logs;
}
```

## Acceptance Criteria

- ✅ API route handles POST requests
- ✅ Integrates with Claude API
- ✅ Extracts and validates JSON responses
- ✅ Handles errors gracefully
- ✅ Basic rate limiting works
- ✅ Health check endpoint works
- ✅ Manual tests pass
- ✅ Returns valid funnel objects

## Testing Commands

```bash
# Start dev server
npm run dev

# Test health check
curl http://localhost:3000/api/chat

# Test funnel generation
./test-api.sh

# Run unit tests
npx vitest run app/api/chat
```

## Troubleshooting

### "API key invalid" error

Check `.env.local`:
```bash
echo $ANTHROPIC_API_KEY
```

Restart dev server after updating:
```bash
npm run dev
```

### JSON parsing fails

Check AI response in logs. Might need to adjust regex:
```typescript
const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
```

### Rate limit too strict

Adjust constants in `rate-limit.ts`:
```typescript
const MAX_REQUESTS = 20; // Increase limit
```

## Next Steps

Once API is working:
- ➡️ **Proceed to Task 05: Block Components - Core**
- API is ready to be called from frontend
- Test with real product descriptions

---

**Status:** ✅ Complete this task before moving to Task 05
