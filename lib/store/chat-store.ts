import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatState {
  // State
  messages: Message[];
  isStreaming: boolean;

  // Actions
  addMessage: (role: Message['role'], content: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearHistory: () => void;
  deleteMessage: (id: string) => void;
  updateMessage: (id: string, content: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isStreaming: false,

      // Add new message
      addMessage: (role, content) => {
        const newMessage: Message = {
          id: crypto.randomUUID(),
          role,
          content,
          timestamp: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      // Set streaming status
      setStreaming: (streaming) => {
        set({ isStreaming: streaming });
      },

      // Clear all messages
      clearHistory: () => {
        set({ messages: [], isStreaming: false });
      },

      // Delete specific message
      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));
      },

      // Update message content
      updateMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          ),
        }));
      },
    }),
    {
      name: 'boron-chat-storage',
      // Only persist messages, not streaming state
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);

// Selectors for optimized re-renders
export const selectMessages = (state: ChatState) => state.messages;
export const selectIsStreaming = (state: ChatState) => state.isStreaming;
export const selectLastMessage = (state: ChatState) =>
  state.messages[state.messages.length - 1];
export const selectMessageCount = (state: ChatState) => state.messages.length;
