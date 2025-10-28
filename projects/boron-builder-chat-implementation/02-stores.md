# Task 02: State Management

⏱ **Estimated Time:** 3 hours

## Objectives

- Set up Zustand stores for chat and funnel state
- Implement LocalStorage persistence
- Create actions for state updates
- Add state selectors for performance
- Test state management flow

## Prerequisites

- ✅ Task 00 completed (project setup)
- ✅ Task 01 completed (schemas defined)
- Zustand installed

## Steps

### 1. Create Chat Store

Create `lib/store/chat-store.ts`:

```typescript
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
```

### 2. Create Funnel Store

Create `lib/store/funnel-store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Funnel, Block } from '@/lib/schemas/funnel.schema';

interface FunnelMetadata {
  createdAt: string | null;
  lastModified: string | null;
  iterations: number;
}

interface FunnelState {
  // State
  funnel: Funnel | null;
  metadata: FunnelMetadata;

  // Actions
  setFunnel: (funnel: Funnel) => void;
  updateBlock: (blockId: string, props: Record<string, any>) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  insertBlock: (block: Block, index?: number) => void;
  clearFunnel: () => void;
  updateMetadata: (updates: Partial<FunnelMetadata>) => void;
}

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set, get) => ({
      // Initial state
      funnel: null,
      metadata: {
        createdAt: null,
        lastModified: null,
        iterations: 0,
      },

      // Set entire funnel (from AI response)
      setFunnel: (funnel) => {
        set((state) => ({
          funnel,
          metadata: {
            createdAt: state.metadata.createdAt || new Date().toISOString(),
            lastModified: new Date().toISOString(),
            iterations: state.metadata.iterations + 1,
          },
        }));
      },

      // Update single block props
      updateBlock: (blockId, props) => {
        set((state) => {
          if (!state.funnel) return state;

          const updatedBlocks = state.funnel.blocks.map((block) =>
            block.id === blockId
              ? { ...block, props: { ...block.props, ...props } }
              : block
          );

          return {
            funnel: { ...state.funnel, blocks: updatedBlocks },
            metadata: {
              ...state.metadata,
              lastModified: new Date().toISOString(),
            },
          };
        });
      },

      // Delete block
      deleteBlock: (blockId) => {
        set((state) => {
          if (!state.funnel) return state;

          return {
            funnel: {
              ...state.funnel,
              blocks: state.funnel.blocks.filter((block) => block.id !== blockId),
            },
            metadata: {
              ...state.metadata,
              lastModified: new Date().toISOString(),
            },
          };
        });
      },

      // Reorder blocks (drag & drop)
      reorderBlocks: (fromIndex, toIndex) => {
        set((state) => {
          if (!state.funnel) return state;

          const blocks = [...state.funnel.blocks];
          const [removed] = blocks.splice(fromIndex, 1);
          blocks.splice(toIndex, 0, removed);

          return {
            funnel: { ...state.funnel, blocks },
            metadata: {
              ...state.metadata,
              lastModified: new Date().toISOString(),
            },
          };
        });
      },

      // Insert new block at specific index
      insertBlock: (block, index) => {
        set((state) => {
          if (!state.funnel) return state;

          const blocks = [...state.funnel.blocks];
          const insertIndex = index ?? blocks.length;
          blocks.splice(insertIndex, 0, block);

          return {
            funnel: { ...state.funnel, blocks },
            metadata: {
              ...state.metadata,
              lastModified: new Date().toISOString(),
            },
          };
        });
      },

      // Clear funnel (start over)
      clearFunnel: () => {
        set({
          funnel: null,
          metadata: {
            createdAt: null,
            lastModified: null,
            iterations: 0,
          },
        });
      },

      // Update metadata manually
      updateMetadata: (updates) => {
        set((state) => ({
          metadata: { ...state.metadata, ...updates },
        }));
      },
    }),
    {
      name: 'boron-funnel-storage',
    }
  )
);

// Selectors
export const selectFunnel = (state: FunnelState) => state.funnel;
export const selectBlocks = (state: FunnelState) => state.funnel?.blocks ?? [];
export const selectBlockById = (id: string) => (state: FunnelState) =>
  state.funnel?.blocks.find((block) => block.id === id);
export const selectMetadata = (state: FunnelState) => state.metadata;
export const selectHasFunnel = (state: FunnelState) => state.funnel !== null;
```

### 3. Create Store Hooks

Create `lib/store/hooks.ts`:

```typescript
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
```

### 4. Create Store Utilities

Create `lib/store/utils.ts`:

```typescript
import type { Message } from './chat-store';
import type { Funnel } from '@/lib/schemas/funnel.schema';

/**
 * Format conversation history for API
 */
export function formatConversationHistory(
  messages: Message[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((msg) => msg.role !== 'system')
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
}

/**
 * Get last N messages
 */
export function getLastMessages(messages: Message[], count: number): Message[] {
  return messages.slice(-count);
}

/**
 * Export funnel as JSON file
 */
export function exportFunnelJSON(funnel: Funnel): void {
  const dataStr = JSON.stringify(funnel, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${funnel.name.toLowerCase().replace(/\s+/g, '-')}-funnel.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import funnel from JSON
 */
export function importFunnelJSON(file: File): Promise<Funnel> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json as Funnel);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Clear all persisted storage
 */
export function clearAllStorage(): void {
  localStorage.removeItem('boron-chat-storage');
  localStorage.removeItem('boron-funnel-storage');
}
```

### 5. Create Store Tests

Create `lib/store/__tests__/chat-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../chat-store';

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      isStreaming: false,
    });
  });

  it('adds messages correctly', () => {
    const { addMessage } = useChatStore.getState();

    addMessage('user', 'Hello');
    addMessage('assistant', 'Hi there!');

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('Hello');
    expect(messages[1].role).toBe('assistant');
  });

  it('sets streaming status', () => {
    const { setStreaming } = useChatStore.getState();

    setStreaming(true);
    expect(useChatStore.getState().isStreaming).toBe(true);

    setStreaming(false);
    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it('clears history', () => {
    const { addMessage, clearHistory } = useChatStore.getState();

    addMessage('user', 'Test');
    expect(useChatStore.getState().messages).toHaveLength(1);

    clearHistory();
    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  it('generates unique IDs for messages', () => {
    const { addMessage } = useChatStore.getState();

    addMessage('user', 'Message 1');
    addMessage('user', 'Message 2');

    const { messages } = useChatStore.getState();
    expect(messages[0].id).not.toBe(messages[1].id);
  });
});
```

Create `lib/store/__tests__/funnel-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useFunnelStore } from '../funnel-store';
import type { Funnel } from '@/lib/schemas/funnel.schema';

const mockFunnel: Funnel = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Funnel',
  product: {
    title: 'Test Product',
    description: 'Test description',
    price: 29.99,
    currency: 'USD',
  },
  blocks: [
    {
      id: 'block-1',
      type: 'Callout',
      props: {
        title: 'Test',
        subtitle: 'Test subtitle',
      },
    },
    {
      id: 'block-2',
      type: 'Text',
      props: {
        content: 'Test content',
      },
    },
  ],
};

describe('FunnelStore', () => {
  beforeEach(() => {
    useFunnelStore.setState({
      funnel: null,
      metadata: {
        createdAt: null,
        lastModified: null,
        iterations: 0,
      },
    });
  });

  it('sets funnel correctly', () => {
    const { setFunnel } = useFunnelStore.getState();

    setFunnel(mockFunnel);

    const { funnel } = useFunnelStore.getState();
    expect(funnel).toEqual(mockFunnel);
  });

  it('updates block props', () => {
    const { setFunnel, updateBlock } = useFunnelStore.getState();

    setFunnel(mockFunnel);
    updateBlock('block-1', { title: 'Updated Title' });

    const { funnel } = useFunnelStore.getState();
    const block = funnel?.blocks.find((b) => b.id === 'block-1');
    expect(block?.props.title).toBe('Updated Title');
  });

  it('deletes blocks', () => {
    const { setFunnel, deleteBlock } = useFunnelStore.getState();

    setFunnel(mockFunnel);
    deleteBlock('block-1');

    const { funnel } = useFunnelStore.getState();
    expect(funnel?.blocks).toHaveLength(1);
    expect(funnel?.blocks[0].id).toBe('block-2');
  });

  it('reorders blocks', () => {
    const { setFunnel, reorderBlocks } = useFunnelStore.getState();

    setFunnel(mockFunnel);
    reorderBlocks(0, 1);

    const { funnel } = useFunnelStore.getState();
    expect(funnel?.blocks[0].id).toBe('block-2');
    expect(funnel?.blocks[1].id).toBe('block-1');
  });

  it('tracks metadata changes', () => {
    const { setFunnel } = useFunnelStore.getState();

    setFunnel(mockFunnel);

    const { metadata } = useFunnelStore.getState();
    expect(metadata.createdAt).toBeTruthy();
    expect(metadata.lastModified).toBeTruthy();
    expect(metadata.iterations).toBe(1);
  });
});
```

### 6. Test Stores Manually

Create `test-stores.ts` in project root:

```typescript
// Run: npx tsx test-stores.ts
import { useChatStore } from './lib/store/chat-store';
import { useFunnelStore } from './lib/store/funnel-store';

console.log('Testing Chat Store...');
const { addMessage, clearHistory } = useChatStore.getState();

addMessage('user', 'Test message 1');
addMessage('assistant', 'Test response 1');

console.log('Messages:', useChatStore.getState().messages);
console.log('Message count:', useChatStore.getState().messages.length);

clearHistory();
console.log('After clear:', useChatStore.getState().messages.length);

console.log('\nTesting Funnel Store...');
const { setFunnel } = useFunnelStore.getState();

const testFunnel = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test',
  product: { title: 'Test', description: 'Test', price: 10, currency: 'USD' },
  blocks: [
    {
      id: 'test-1',
      type: 'Callout' as const,
      props: { title: 'Test', subtitle: 'Test' },
    },
  ],
};

setFunnel(testFunnel);
console.log('Funnel set:', useFunnelStore.getState().funnel?.name);
console.log('Metadata:', useFunnelStore.getState().metadata);

console.log('\n✅ Store tests passed!');
```

Run it:

```bash
npx tsx test-stores.ts
```

## Acceptance Criteria

- ✅ Chat store manages messages correctly
- ✅ Funnel store manages funnel state correctly
- ✅ LocalStorage persistence works
- ✅ Actions update state immutably
- ✅ Selectors prevent unnecessary re-renders
- ✅ Unit tests pass
- ✅ No TypeScript errors
- ✅ Manual tests succeed

## Testing Commands

```bash
# Run store tests
npx vitest run lib/store

# Type check
npx tsc --noEmit

# Manual test
npx tsx test-stores.ts
```

## Troubleshooting

### LocalStorage not persisting

Make sure `persist` middleware is configured:

```typescript
persist(
  (set, get) => ({ /* store */ }),
  { name: 'boron-chat-storage' }
)
```

### Type errors with Zustand

Ensure you're using the correct type annotations:

```typescript
create<YourStateInterface>()(
  persist(/* ... */)
)
```

## Next Steps

Once stores are working:
- ➡️ **Proceed to Task 03: System Prompt**
- Stores are now ready to be used in components
- Import with: `import { useChatStore } from '@/lib/store/chat-store'`

---

**Status:** ✅ Complete this task before moving to Task 03
