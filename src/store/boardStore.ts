import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { KanbanCard, KanbanColumn, Ingredient, RecipeStatus } from '../types/kanban';

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
interface BoardState {
  columns: Column[];
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setToken: (token: string | null) => void;
  fetchBoard: () => Promise<void>;
  addCard: (columnId: string, title: string, description?: string) => Promise<void>;
  updateCard: (columnId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCard: (columnId: string, cardId: string) => Promise<void>;
  moveCard: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => Promise<void>;
  addColumn: (title: string, limit?: number) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<Omit<Column, 'id' | 'cards'>>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  moveColumn: (sourceIndex: number, destinationIndex: number) => Promise<void>;
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
    if (response.status === 401) {
      console.error('Authentication error - attempting to refresh session');
      // Instead of immediately clearing the token, try to refresh the session
      try {
        // Attempt to get a new token from Clerk
        const token = await window.Clerk?.session?.getToken?.() || null;
        if (token) {
          console.log('Successfully refreshed token');
          useBoardStore.getState().setToken(token);
          // Retry the original request with the new token
          const retryResponse = await fetch(response.url, {
            ...response,
            headers: {
              ...response.headers,
              'Authorization': `Bearer ${token}`
            }
          });
          return handleResponse(retryResponse);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Only clear token if refresh fails
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
};

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
    return await handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

type SetState = (
  partial: BoardState | Partial<BoardState> | ((state: BoardState) => BoardState | Partial<BoardState>),
  replace?: boolean
) => void;

export const useBoardStore = create<BoardState>((set: SetState, get) => ({
  columns: [],
  token: null,
  isLoading: false,
  error: null,
  
  setToken: (token: string | null) => {
    console.log('Setting auth token:', token ? 'token present' : 'no token');
    set({ token });
    if (token) {
      // Fetch board data when token is set
      get().fetchBoard();
    }
  },

  fetchBoard: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const boards = await makeRequest('/api/boards', {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      console.log('Fetched boards:', boards);

      // If no boards exist, create a default one
      if (!boards || boards.length === 0) {
        console.log('No boards found, creating default board');
        const defaultBoard = await makeRequest('/api/boards', {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            title: 'Recipe Development Board',
            columns: [
              { title: 'To Do', order: 0 },
              { title: 'In Progress', order: 1 },
              { title: 'Done', order: 2 }
            ]
          })
        });
        console.log('Created default board:', defaultBoard);
        set({ columns: defaultBoard.columns || [], isLoading: false });
      } else {
        // Use the first board
        const activeBoard = boards[0];
        console.log('Using board:', activeBoard);
        set({ columns: activeBoard.columns || [], isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch board',
        isLoading: false 
      });
    }
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

  updateCard: async (columnId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) => {
    console.log('Updating card:', { columnId, cardId, updates });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const updatedCard = await makeRequest(`/api/cards/${cardId}`, {
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

      // First update the card's column
      await makeRequest(`/api/cards/${cardToMove.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          columnId: destColId,
          order: destIndex,
        }),
      });

      // Then update the order of all cards in the destination column
      const updatedCards = newDestCol.cards.map((card, index) => ({
        id: card.id,
        order: index,
      }));

      await makeRequest(`/api/columns/${destColId}/cards`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          cards: updatedCards,
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

  addColumn: async (title: string, limit?: number) => {
    console.log('Adding column:', { title, limit });
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const boards = await makeRequest('/api/boards', {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!boards || boards.length === 0) {
        throw new Error('No board found');
      }

      const boardId = boards[0].id;
      const order = get().columns.length;

      const newColumn = await makeRequest('/api/columns', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          title,
          limit,
          boardId,
          order,
        }),
      });

      console.log('Created new column:', newColumn);

      // Update local state with the returned column
      set((state) => ({
        columns: [...state.columns, newColumn],
      }));
    } catch (error) {
      console.error('Error adding column:', error);
      throw error;
    }
  },

  updateColumn: async (columnId: string, updates: Partial<Omit<Column, 'id' | 'cards'>>) => {
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

  moveColumn: async (sourceIndex: number, destinationIndex: number) => {
    try {
      const token = get().token;
      if (!token) throw new Error('No auth token available');

      const newColumns = [...get().columns];
      const [movedColumn] = newColumns.splice(sourceIndex, 1);
      newColumns.splice(destinationIndex, 0, movedColumn);

      // Update the backend with new column order
      await makeRequest('/api/boards/columns', {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          columns: newColumns.map((col, index) => ({
            id: col.id,
            order: index,
          })),
        }),
      });

      set({ columns: newColumns });
    } catch (error) {
      console.error('Error moving column:', error);
      // Revert to previous state on error
      const state = get();
      set({ columns: state.columns });
      throw error;
    }
  },

  getCard: (columnId: string, cardId: string) => {
    const state = get();
    const column = state.columns.find((col) => col.id === columnId);
    return column?.cards.find((card) => card.id === cardId);
  }
})); 