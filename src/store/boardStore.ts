import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export interface Card {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  labels?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  limit?: number;
}

interface BoardState {
  columns: Column[];
  addCard: (columnId: string, title: string, description?: string) => void;
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        id: uuid(), 
        title: 'Task 2', 
        description: 'Description for task 2',
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
  
  addCard: (columnId: string, title: string, description?: string) => 
    set((state) => ({
      columns: state.columns.map((col) => {
        if (col.id === columnId) {
          const newCard: Card = {
            id: uuid(),
            title,
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return {
            ...col,
            cards: [...col.cards, newCard],
          };
        }
        return col;
      }),
    })),

  updateCard: (columnId: string, cardId: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>) =>
    set((state) => ({
      columns: state.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.map((card) => {
              if (card.id === cardId) {
                return {
                  ...card,
                  ...updates,
                  updatedAt: new Date(),
                };
              }
              return card;
            }),
          };
        }
        return col;
      }),
    })),

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

  moveCard: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) =>
    set((state) => {
      const newColumns = [...state.columns];
      const sourceCol = newColumns.find((col) => col.id === sourceColId);
      const destCol = newColumns.find((col) => col.id === destColId);
      
      if (!sourceCol || !destCol) return state;
      
      const [movedCard] = sourceCol.cards.splice(sourceIndex, 1);
      destCol.cards.splice(destIndex, 0, movedCard);
      
      return { columns: newColumns };
    }),

  addColumn: (title: string, limit?: number) =>
    set((state) => ({
      columns: [
        ...state.columns,
        {
          id: uuid(),
          title,
          cards: [],
          limit,
        },
      ],
    })),

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