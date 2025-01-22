import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { KanbanCard, KanbanColumn, Ingredient } from '../types/kanban';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.agilechef.seabreeze.farm';

// Store interface
interface BoardState {
  columns: Column[];
  token: string | null;
  setToken: (token: string | null) => void;
  addCard: (columnId: string, title: string, description?: string) => Promise<void>;
  updateCard: (columnId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCard: (columnId: string, cardId: string) => Promise<void>;
  moveCard: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => Promise<void>;
  addColumn: (title: string, limit?: number) => void;
  updateColumn: (columnId: string, updates: Partial<Omit<Column, 'id' | 'cards'>>) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (sourceIndex: number, destinationIndex: number) => void;
  getCard: (columnId: string, cardId: string) => Card | undefined;
}

export type Card = KanbanCard;
export type Column = KanbanColumn;

// Helper function to get auth headers
const getAuthHeaders = (token: string | null) => {
  if (!token) {
    throw new Error('No auth token available');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const text = await response.text();
  console.log('Response status:', response.status);
  console.log('Response text:', text);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${text}`);
  }

  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('Failed to parse response JSON:', e);
    throw new Error('Invalid response from server');
  }
};

// Helper function to make API requests
const makeRequest = async (endpoint: string, options: RequestInit) => {
  const url = `${API_URL}${endpoint}`;
  console.log('Making API request:', { url, method: options.method });
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies if needed
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { 
        id: uuid(), 
        title: 'Task 1', 
        description: 'Description for task 1',
        ingredients: [],
        instructions: [],
        status: 'dormant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        id: uuid(), 
        title: 'Task 2', 
        description: 'Description for task 2',
        ingredients: [],
        instructions: [],
        status: 'dormant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    cards: [
      { 
        id: uuid(), 
        title: 'Task 3', 
        description: 'Description for task 3',
        ingredients: [],
        instructions: [],
        status: 'in-progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { 
        id: uuid(), 
        title: 'Task 4', 
        description: 'Description for task 4',
        ingredients: [],
        instructions: [],
        status: 'fully-stocked',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

type SetState = (
  partial: BoardState | Partial<BoardState> | ((state: BoardState) => BoardState | Partial<BoardState>),
  replace?: boolean
) => void;

export const useBoardStore = create<BoardState>((set: SetState, get) => ({
  columns: initialColumns,
  token: null,
  
  setToken: (token: string | null) => {
    console.log('Setting auth token:', token ? 'token present' : 'no token');
    set({ token });
  },
  
  addCard: async (columnId: string, title: string, description?: string) => {
    console.log('Adding card:', { columnId, title, description });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const payload = {
        title,
        description: description || '',
        columnId,
        order: get().columns.find(col => col.id === columnId)?.cards.length || 0,
        ingredients: [], // Initialize with empty ingredients for now
        status: 'dormant' as const, // Initial status
        instructions: [], // Initialize with empty instructions
        labels: [], // Initialize with empty labels
      };
      
      console.log('Sending payload to backend:', payload);
      
      const newCard = await makeRequest('/card', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });

      console.log('Card created on backend:', newCard);

      // Update local state
      set((state) => ({
        columns: state.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: [...col.cards, {
                ...newCard,
                createdAt: new Date(newCard.createdAt),
                updatedAt: new Date(newCard.updatedAt),
              }],
            };
          }
          return col;
        }),
      }));
    } catch (error) {
      console.error('Error adding card:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      throw error;
    }
  },

  updateCard: async (columnId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) => {
    console.log('Updating card:', { columnId, cardId, updates });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const updatedCard = await makeRequest(`/card/${cardId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updates),
      });

      console.log('Card updated on backend:', updatedCard);

      // Update local state
      set((state) => ({
        columns: state.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: col.cards.map((card) => {
                if (card.id === cardId) {
                  return {
                    ...card,
                    ...updatedCard,
                    createdAt: new Date(updatedCard.createdAt),
                    updatedAt: new Date(updatedCard.updatedAt),
                  };
                }
                return card;
              }),
            };
          }
          return col;
        }),
      }));
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  deleteCard: async (columnId: string, cardId: string) => {
    console.log('Deleting card:', { columnId, cardId });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const response = await fetch(`${API_URL}/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      // Update local state
      set((state) => ({
        columns: state.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: col.cards.filter((card) => card.id !== cardId),
            };
          }
          return col;
        }),
      }));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },

  moveCard: async (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => {
    console.log('Moving card:', { sourceColId, destColId, sourceIndex, destIndex });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const state = get();
      const sourceCol = state.columns.find((col) => col.id === sourceColId);
      const destCol = state.columns.find((col) => col.id === destColId);
      
      if (!sourceCol || !destCol) {
        console.error('Source or destination column not found:', { sourceColId, destColId });
        return;
      }

      const cardToMove = sourceCol.cards[sourceIndex];
      if (!cardToMove) {
        console.error('Card not found at source index:', sourceIndex);
        return;
      }

      // Optimistically update the local state
      const newColumns = [...state.columns];
      const newSourceCol = newColumns.find((col) => col.id === sourceColId)!;
      const newDestCol = newColumns.find((col) => col.id === destColId)!;
      const [movedCard] = newSourceCol.cards.splice(sourceIndex, 1);
      newDestCol.cards.splice(destIndex, 0, movedCard);

      // Update the local state immediately
      set({ columns: newColumns });

      // Then update the backend
      await makeRequest(`/column/${destColId}/cards`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          cards: newDestCol.cards.map((card, index) => ({
            id: card.id,
            order: index,
            columnId: destColId,
          })),
        }),
      });

      console.log('Card moved successfully:', movedCard);
    } catch (error) {
      console.error('Error moving card:', error);
      // Revert local state on error
      const state = get();
      set({ columns: state.columns });
      throw error;
    }
  },

  addColumn: (title: string, limit?: number) => {
    console.log('Adding column:', { title, limit });
    set((state) => {
      const newColumn = {
        id: uuid(),
        title,
        cards: [],
        limit,
      };
      console.log('Created new column:', newColumn);
      return {
        columns: [...state.columns, newColumn],
      };
    });
  },

  updateColumn: (columnId: string, updates: Partial<Omit<Column, 'id' | 'cards'>>) =>
    set((state) => ({
      columns: state.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            ...updates,
          };
        }
        return col;
      }),
    })),

  deleteColumn: (columnId: string) =>
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== columnId),
    })),

  moveColumn: (sourceIndex: number, destinationIndex: number) =>
    set((state) => {
      const newColumns = [...state.columns];
      const [movedColumn] = newColumns.splice(sourceIndex, 1);
      newColumns.splice(destinationIndex, 0, movedColumn);
      return { columns: newColumns };
    }),

  getCard: (columnId: string, cardId: string) => {
    const state = get();
    const column = state.columns.find((col) => col.id === columnId);
    return column?.cards.find((card) => card.id === cardId);
  }
})); 