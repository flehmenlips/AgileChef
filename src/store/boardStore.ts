import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { KanbanCard, KanbanColumn, Ingredient } from '../types/kanban';

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
      // Call the backend API
      const response = await fetch('/api/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          columnId,
          order: get().columns.find(col => col.id === columnId)?.cards.length || 0,
          ingredients: [], // Initialize with empty ingredients for now
          status: 'active',
          instructions: [], // Initialize with empty instructions
          labels: [], // Initialize with empty labels
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const newCard = await response.json();
      console.log('Card created on backend:', newCard);

      // Update local state
      set((state) => ({
        columns: state.columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: [...col.cards, {
                id: newCard.id,
                title: newCard.title,
                description: newCard.description,
                createdAt: new Date(newCard.createdAt),
                updatedAt: new Date(newCard.updatedAt),
                labels: newCard.labels,
                priority: newCard.priority,
              }],
            };
          }
          return col;
        }),
      }));
    } catch (error) {
      console.error('Error adding card:', error);
      // You might want to show an error notification to the user here
    }
  },

  updateCard: (columnId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) => {
    console.log('Updating card:', { columnId, cardId, updates });
    set((state) => ({
      columns: state.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.map((card) => {
              if (card.id === cardId) {
                const updatedCard = {
                  ...card,
                  ...updates,
                  updatedAt: new Date(),
                };
                console.log('Updated card:', updatedCard);
                return updatedCard;
              }
              return card;
            }),
          };
        }
        return col;
      }),
    }));
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

  moveCard: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => {
    console.log('Moving card:', { sourceColId, destColId, sourceIndex, destIndex });
    set((state) => {
      const newColumns = [...state.columns];
      const sourceCol = newColumns.find((col) => col.id === sourceColId);
      const destCol = newColumns.find((col) => col.id === destColId);
      
      if (!sourceCol || !destCol) {
        console.error('Source or destination column not found:', { sourceColId, destColId });
        return state;
      }
      
      const [movedCard] = sourceCol.cards.splice(sourceIndex, 1);
      destCol.cards.splice(destIndex, 0, movedCard);
      console.log('Card moved successfully:', movedCard);
      
      return { columns: newColumns };
    });
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