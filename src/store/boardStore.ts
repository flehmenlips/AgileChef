import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export interface Card {
  id: string;
  title: string;
  description?: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface BoardState {
  columns: Column[];
  addCard: (columnId: string, title: string, description?: string) => void;
  moveCard: (sourceColId: string, destColId: string, sourceIndex: number, destIndex: number) => void;
  addColumn: (title: string) => void;
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: uuid(), title: 'Task 1', description: 'Description for task 1' },
      { id: uuid(), title: 'Task 2', description: 'Description for task 2' },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    cards: [
      { id: uuid(), title: 'Task 3', description: 'Description for task 3' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: uuid(), title: 'Task 4', description: 'Description for task 4' },
    ],
  },
];

type SetState = (
  partial: BoardState | Partial<BoardState> | ((state: BoardState) => BoardState | Partial<BoardState>),
  replace?: boolean
) => void;

export const useBoardStore = create<BoardState>((set: SetState) => ({
  columns: initialColumns,
  addCard: (columnId: string, title: string, description?: string) => 
    set((state) => ({
      columns: state.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, { id: uuid(), title, description }],
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
  addColumn: (title: string) =>
    set((state) => ({
      columns: [
        ...state.columns,
        {
          id: uuid(),
          title,
          cards: [],
        },
      ],
    })),
})); 