'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { useFunnelStore } from '@/lib/store/funnel-store';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatPane() {
  const { messages, addMessage, setStreaming, isStreaming, clearHistory } = useChatStore();
  const { funnel, setFunnel } = useFunnelStore();
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    clearHistory();
    setFunnel(null);
    setError(null);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Add user message
    addMessage('user', content);
    setStreaming(true);
    setError(null);

    try {
      // Call API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages,
          currentFunnel: funnel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate funnel');
      }

      const data = await response.json();

      // Add AI response
      addMessage('assistant', data.message || 'Funnel generated successfully!');

      // Update funnel if returned
      if (data.funnel) {
        setFunnel(data.funnel);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      addMessage('system', `Error: ${errorMsg}`);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Boron Builder</h1>
            <p className="text-sm text-gray-600">
              {funnel ? 'Refine your funnel' : 'Describe your product to generate a funnel'}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              title="Clear chat and preview"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isStreaming={isStreaming} />

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200 text-red-700 text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0">
        <MessageInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={
            funnel
              ? 'Refine your funnel (e.g., "Add urgency banner at top")'
              : 'Describe your product (e.g., "Organic sleep gummies with melatonin")'
          }
        />
      </div>
    </div>
  );
}
