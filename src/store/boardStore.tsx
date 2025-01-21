import { create } from 'zustand';
import { KanbanColumn, KanbanCard, KanbanCardStatus } from '../types/kanban';
import React, { createContext, useContext } from 'react';

interface BoardState {
  columns: KanbanColumn[];
  isLoading: boolean;
  error: string | null;
  token: string | null;
  setToken: (token: string) => void;
  fetchBoard: () => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  updateColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  moveColumn: (fromIndex: number, toIndex: number) => Promise<void>;
  addCard: (columnId: string, title: string) => Promise<void>;
  updateCard: (columnId: string, cardId: string, data: Partial<KanbanCard>) => Promise<void>;
  deleteCard: (columnId: string, cardId: string) => Promise<void>;
  moveCard: (fromColumnId: string, toColumnId: string, fromIndex: number, toIndex: number) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],
  isLoading: false,
  error: null,
  token: null,
  setToken: (token) => set({ token }),
  fetchBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulated API call
      const columns: KanbanColumn[] = [];
      set({ columns });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  addColumn: async (title) => {
    set({ isLoading: true, error: null });
    try {
      const newColumn: KanbanColumn = {
        id: Date.now().toString(),
        title,
        cards: []
      };
      set((state) => ({
        columns: [...state.columns, newColumn]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  updateColumn: async (columnId, title) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, title } : col
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  deleteColumn: async (columnId) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== columnId)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  moveColumn: async (fromIndex, toIndex) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => {
        const columns = [...state.columns];
        const [removed] = columns.splice(fromIndex, 1);
        columns.splice(toIndex, 0, removed);
        return { columns };
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  addCard: async (columnId, title) => {
    set({ isLoading: true, error: null });
    try {
      const newCard: KanbanCard = {
        id: Date.now().toString(),
        title,
        ingredients: [],
        instructions: [],
        status: 'draft' as KanbanCardStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                cards: [...col.cards, newCard]
              }
            : col
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  updateCard: async (columnId, cardId, data) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                cards: col.cards.map((card) =>
                  card.id === cardId
                    ? { ...card, ...data, updatedAt: new Date().toISOString() }
                    : card
                )
              }
            : col
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  deleteCard: async (columnId, cardId) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                cards: col.cards.filter((card) => card.id !== cardId)
              }
            : col
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  moveCard: async (fromColumnId, toColumnId, fromIndex, toIndex) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => {
        const newColumns = [...state.columns];
        const fromColumn = newColumns.find((col) => col.id === fromColumnId);
        const toColumn = newColumns.find((col) => col.id === toColumnId);
        
        if (!fromColumn || !toColumn) return state;
        
        const [movedCard] = fromColumn.cards.splice(fromIndex, 1);
        toColumn.cards.splice(toIndex, 0, movedCard);
        
        return { columns: newColumns };
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Create a context for the board store
const BoardStoreContext = createContext<ReturnType<typeof useBoardStore> | null>(null);

// Create a provider component
export function BoardStoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <BoardStoreContext.Provider value={useBoardStore()}>
      {children}
    </BoardStoreContext.Provider>
  );
} 