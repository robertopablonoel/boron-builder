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
