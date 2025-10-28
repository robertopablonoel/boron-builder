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
  updateBlock: (blockId: string, props: Record<string, unknown>) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  insertBlock: (block: Block, index?: number) => void;
  clearFunnel: () => void;
  updateMetadata: (updates: Partial<FunnelMetadata>) => void;
}

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set) => ({
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
