import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FUNNEL_BUILDER_SYSTEM_PROMPT } from '@/lib/prompts/funnel-builder';
import { validateFunnel, validateFunnelRules } from '@/lib/validation';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { logRequest } from '@/lib/api/logger';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Constants
const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 4096;
const MAX_CONVERSATION_LENGTH = 20; // Prevent token overflow

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('📨 Chat API request received');

  try {
    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      logRequest({
        timestamp: new Date().toISOString(),
        method: 'POST',
        path: '/api/chat',
        message: 'Rate limit exceeded',
        responseTime: Date.now() - startTime,
        success: false,
      });

      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again in a moment.',
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

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

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const content = firstBlock.text;
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

    // Log successful request
    logRequest({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/chat',
      message: `Generated funnel: ${funnel.name}`,
      responseTime: Date.now() - startTime,
      success: true,
    });

    // Return success response
    return NextResponse.json({
      message: `✅ I've generated your "${funnel.name}" funnel with ${funnel.blocks.length} blocks! Check the preview on the right.`,
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

    // Log error
    logRequest({
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/chat',
      message: error.message || 'Unknown error',
      responseTime: Date.now() - startTime,
      success: false,
    });

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
