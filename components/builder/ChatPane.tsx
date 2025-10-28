'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatStore } from '@/lib/store/chat-store';
import { useFunnelStore } from '@/lib/store/funnel-store';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ProductPickerModal } from './product-picker-modal';

interface Product {
  id: string
  shopify_product_id: string
  title: string
  description: string
  price: number
  compare_at_price: number | null
  featured_image: string | null
  vendor: string
  product_type: string
  tags: string[]
  variants: any[]
}

export function ChatPane() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId') || searchParams.get('funnelId');

  const { messages, addMessage, setStreaming, isStreaming, clearHistory } = useChatStore();
  const { funnel, setFunnel } = useFunnelStore();
  const [error, setError] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleClear = () => {
    clearHistory();
    setFunnel(null);
    setError(null);
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    // Optionally auto-populate a message about the product
    const productMessage = `Create a funnel for ${product.title} (${product.vendor}) - $${product.price.toFixed(2)}`;
    handleSendMessage(productMessage);
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
          selectedProduct: selectedProduct,
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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Boron Builder</h1>
            <p className="text-sm text-gray-600">
              {selectedProduct
                ? `Building funnel for: ${selectedProduct.title}`
                : funnel
                  ? 'Refine your funnel'
                  : 'Select a product or describe what you want to sell'}
            </p>
          </div>
          <div className="flex gap-2">
            {storeId && (
              <button
                onClick={() => setShowProductPicker(true)}
                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors font-medium"
                title="Select a product from your store"
              >
                {selectedProduct ? 'Change Product' : 'Select Product'}
              </button>
            )}
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
            selectedProduct
              ? 'Refine your funnel (e.g., "Add urgency banner at top")'
              : funnel
                ? 'Refine your funnel (e.g., "Add urgency banner at top")'
                : 'Describe your product (e.g., "Organic sleep gummies with melatonin")'
          }
        />
      </div>

      {/* Product Picker Modal */}
      {storeId && (
        <ProductPickerModal
          isOpen={showProductPicker}
          onClose={() => setShowProductPicker(false)}
          storeId={storeId}
          onSelectProduct={handleProductSelect}
        />
      )}
    </div>
  );
}
