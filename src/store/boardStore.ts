import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { KanbanCard, KanbanColumn, Ingredient } from '../types/kanban';

const API_URL = import.meta.env.VITE_API_URL;

export type Card = KanbanCard;
export type Column = KanbanColumn;

interface BoardState {
  columns: Column[];
  addCard: (columnId: string, title: string, description?: string) => Promise<void>;
  updateCard: (columnId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  moveCard: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => void;
  addColumn: (title: string, limit?: number) => void;
  updateColumn: (columnId: string, updates: Partial<Omit<Column, 'id' | 'cards'>>) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (sourceIndex: number, destinationIndex: number) => void;
  getCard: (columnId: string, cardId: string) => Card | undefined;
}

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
  
  addCard: async (columnId: string, title: string, description?: string) => {
    console.log('Adding card:', { columnId, title, description });
    try {
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
      
      const response = await fetch(`${API_URL}/card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to create card: ${response.status} ${responseText}`);
      }

      let newCard;
      try {
        newCard = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response JSON:', e);
        throw new Error('Invalid response from server');
      }

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
      const response = await fetch(`${API_URL}/card/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }

      const updatedCard = await response.json();
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

  deleteCard: (columnId: string, cardId: string) =>
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
    })),

  moveCard: async (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => {
    console.log('Moving card:', { sourceColId, destColId, sourceIndex, destIndex });
    try {
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
      const response = await fetch(`${API_URL}/column/${destColId}/cards`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: newDestCol.cards.map((card, index) => ({
            id: card.id,
            order: index,
            columnId: destColId,
          })),
        }),
      });

      if (!response.ok) {
        // If the backend update fails, revert the local state
        console.error('Failed to update card order on backend');
        set({ columns: state.columns });
        throw new Error('Failed to move card');
      }

      console.log('Card moved successfully:', movedCard);
    } catch (error) {
      console.error('Error moving card:', error);
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