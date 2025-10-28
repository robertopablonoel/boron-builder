import { useChatStore, selectMessages, selectIsStreaming } from './chat-store';
import { useFunnelStore, selectFunnel, selectBlocks } from './funnel-store';

/**
 * Hook to get only messages (optimized)
 */
export function useMessages() {
  return useChatStore(selectMessages);
}

/**
 * Hook to get streaming status
 */
export function useIsStreaming() {
  return useChatStore(selectIsStreaming);
}

/**
 * Hook to get current funnel
 */
export function useFunnel() {
  return useFunnelStore(selectFunnel);
}

/**
 * Hook to get blocks only
 */
export function useBlocks() {
  return useFunnelStore(selectBlocks);
}

/**
 * Hook to get chat actions
 */
export function useChatActions() {
  return {
    addMessage: useChatStore((state) => state.addMessage),
    setStreaming: useChatStore((state) => state.setStreaming),
    clearHistory: useChatStore((state) => state.clearHistory),
  };
}

/**
 * Hook to get funnel actions
 */
export function useFunnelActions() {
  return {
    setFunnel: useFunnelStore((state) => state.setFunnel),
    updateBlock: useFunnelStore((state) => state.updateBlock),
    deleteBlock: useFunnelStore((state) => state.deleteBlock),
    clearFunnel: useFunnelStore((state) => state.clearFunnel),
  };
}
