import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { KanbanCard, KanbanColumn, Ingredient, RecipeStatus, KanbanBoard } from '../types/kanban';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.agilechef.seabreeze.farm';

// Add type declaration for Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

// Store interface
export interface BoardState {
  columns: KanbanColumn[];
  isLoading: boolean;
  error: string | null;
  token: string | null;
  board: KanbanBoard | null;
  setToken: (token: string | null) => void;
  fetchBoard: (boardId: string) => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  updateColumn: (columnId: string, updates: { title?: string; limit?: number }) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  moveColumn: (fromIndex: number, toIndex: number) => Promise<void>;
  addCard: (columnId: string, title: string) => Promise<void>;
  updateCard: (columnId: string, cardId: string, data: Partial<KanbanCard>) => Promise<void>;
  deleteCard: (columnId: string, cardId: string) => Promise<void>;
  moveCard: (fromColumnId: string, toColumnId: string, fromIndex: number, toIndex: number) => Promise<void>;
  clearError: () => void;
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
const handleResponse = async (response: Response, originalOptions?: RequestInit) => {
  const text = await response.text();
  console.log('Response status:', response.status);
  console.log('Response text:', text);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    if (response.status === 401) {
      console.error('Authentication error - attempting to refresh session');
      try {
        // Attempt to get a new token from Clerk
        const token = await window.Clerk?.session?.getToken?.() || null;
        if (token && originalOptions) {
          console.log('Successfully refreshed token');
          useBoardStore.getState().setToken(token);
          // Retry the original request with the new token
          const retryResponse = await fetch(response.url, {
            ...originalOptions,
            headers: {
              ...originalOptions.headers,
              'Authorization': `Bearer ${token}`
            }
          });
          return handleResponse(retryResponse);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        useBoardStore.getState().setToken(null);
        throw new Error('Authentication failed - please sign in again');
      }
    }
    throw new Error(`API error: ${response.status} ${text}`);
  }

  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('Failed to parse response JSON:', e);
    throw new Error('Invalid response from server');
  }
}

// Helper function to make API requests
const makeRequest = async (endpoint: string, options: RequestInit) => {
  const url = `${API_URL}${endpoint}`;
  const token = useBoardStore.getState().token;
  
  if (!token) {
    try {
      // Try to get a fresh token from Clerk if none exists
      const newToken = await window.Clerk?.session?.getToken?.() || null;
      if (newToken) {
        console.log('Retrieved fresh token');
        useBoardStore.getState().setToken(newToken);
      } else {
        throw new Error('No auth token available and unable to refresh');
      }
    } catch (error) {
      console.error('Failed to get fresh token:', error);
      throw new Error('No auth token available');
    }
  }
  
  console.log('Making API request:', { 
    url, 
    method: options.method,
    hasToken: !!token,
    headers: options.headers
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });
    return await handleResponse(response, options);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

type SetState = (
  partial: BoardState | Partial<BoardState> | ((state: BoardState) => BoardState | Partial<BoardState>),
  replace?: boolean
) => void;

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  isLoading: false,
  error: null,
  token: null,
  board: null,

  clearError: () => set({ error: null }),

  setToken: (token: string | null) => {
    console.log('Setting auth token:', token ? 'token present' : 'no token');
    set({ token });
    if (token) {
      get().fetchBoard('');
    }
  },

  fetchBoard: async (boardId: string) => {
    try {
      set({ isLoading: true, error: null });
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const boards = await makeRequest(`/api/boards`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      // Get the first board or create a new one if none exists
      const currentBoard = Array.isArray(boards) && boards.length > 0 
        ? boards[0] 
        : await makeRequest('/api/boards', {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ title: 'Recipe Development Board' })
          });

      set({ 
        board: currentBoard,
        columns: currentBoard.columns || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching board:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch board',
        isLoading: false 
      });
    }
  },

  addColumn: async (title: string) => {
    try {
      set({ isLoading: true, error: null });
      let token = get().token;
      if (!token) {
        // Try to get a fresh token
        const newToken = await window.Clerk?.session?.getToken?.() || null;
        if (!newToken) throw new Error('No auth token available');
        get().setToken(newToken);
      }

      const state = get();
      const board = state.board;
      if (!board?.id) throw new Error('No board found');

      const response = await makeRequest('/api/columns', {
        method: 'POST',
        headers: getAuthHeaders(get().token), // Use the potentially refreshed token
        body: JSON.stringify({ 
          title, 
          boardId: board.id,
          order: state.columns.length 
        })
      });

      set(state => ({
        columns: [...state.columns, {
          ...response,
          cards: response.cards || []
        }]
      }));
    } catch (error) {
      console.error('Error adding column:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add column' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateColumn: async (columnId: string, updates: { title?: string; limit?: number }) => {
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const updatedColumn = await makeRequest(`/api/columns/${columnId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updates),
      });

      set((state) => ({
        columns: state.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              ...updatedColumn,
            };
          }
          return col;
        }),
      }));
    } catch (error) {
      console.error('Error updating column:', error);
      throw error;
    }
  },

  deleteColumn: async (columnId: string) => {
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      await makeRequest(`/api/columns/${columnId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      set((state) => ({
        columns: state.columns.filter((col) => col.id !== columnId),
      }));
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  },

  moveColumn: async (fromIndex: number, toIndex: number) => {
    try {
      set({ isLoading: true, error: null });
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const newColumns = [...get().columns];
      const [movedColumn] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, movedColumn);

      // Optimistically update the UI
      set({ columns: newColumns });

      // Update the backend with new column order
      await makeRequest(`/api/columns/${movedColumn.id}/reorder`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          boardId: newColumns[0].boardId,
          columns: newColumns.map((col, index) => ({
            id: col.id,
            order: index,
          })),
        }),
      });

      // No need to re-fetch or update state since our optimistic update matches the backend
    } catch (error) {
      console.error('Error moving column:', error);
      // Revert to previous state on error
      const state = get();
      set({ columns: state.columns, error: error instanceof Error ? error.message : 'Failed to move column' });
    } finally {
      set({ isLoading: false });
    }
  },

  addCard: async (columnId: string, title: string) => {
    console.log('Adding card:', { columnId, title });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const payload = {
        title,
        description: '',
        columnId,
        order: get().columns.find(col => col.id === columnId)?.cards.length || 0,
        ingredients: [], // Initialize with empty ingredients for now
        status: RecipeStatus.DORMANT, // Initial status
        instructions: [], // Initialize with empty instructions
        labels: [], // Initialize with empty labels
      };
      
      console.log('Sending payload to backend:', payload);
      
      const newCard = await makeRequest('/api/cards', {
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

  updateCard: async (columnId: string, cardId: string, data: Partial<KanbanCard>) => {
    console.log('Updating card:', { columnId, cardId, data });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const updatedCard = await makeRequest(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
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

      await makeRequest(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

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

  moveCard: async (fromColumnId: string, toColumnId: string, fromIndex: number, toIndex: number) => {
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const sourceColumn = get().columns.find(col => col.id === fromColumnId);
      const destColumn = get().columns.find(col => col.id === toColumnId);
      
      if (!sourceColumn || !destColumn) {
        throw new Error('Column not found');
      }

      const cardToMove = sourceColumn.cards[fromIndex];
      if (!cardToMove) {
        throw new Error('Card not found');
      }

      // Optimistically update the UI
      set(state => {
        const newColumns = state.columns.map(col => {
          if (col.id === fromColumnId) {
            return {
              ...col,
              cards: col.cards.filter((_, idx) => idx !== fromIndex)
            };
          }
          if (col.id === toColumnId) {
            const newCards = [...col.cards];
            newCards.splice(toIndex, 0, cardToMove);
            return {
              ...col,
              cards: newCards
            };
          }
          return col;
        });
        return { columns: newColumns };
      });

      // Update the card's column and order
      await makeRequest(`/api/cards/${cardToMove.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          columnId: toColumnId,
          order: toIndex
        })
      });

      // Update the order of all cards in the destination column
      await makeRequest(`/api/columns/${toColumnId}/cards`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          cardIds: destColumn.cards.map(card => card.id)
        })
      });

    } catch (error) {
      console.error('Error moving card:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to move card' });
      // Revert the optimistic update by re-fetching the board
      get().fetchBoard('');
    }
  }
})); 