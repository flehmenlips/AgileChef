export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
  boardId: string;
  order: number;
}

export interface Ingredient {
  id: string;
  quantity: number;
  unit: Unit;
  name: string;
}

export enum Unit {
  G = 'G',
  KG = 'KG',
  ML = 'ML',
  L = 'L',
  TSP = 'TSP',
  TBSP = 'TBSP',
  CUP = 'CUP',
  PIECE = 'PIECE',
  PINCH = 'PINCH'
}

export enum RecipeStatus {
  FULLY_STOCKED = 'FULLY_STOCKED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  DORMANT = 'DORMANT'
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  status: RecipeStatus;
  labels?: string[];
  assignees?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: KanbanColumn[];
  createdAt: Date;
  updatedAt: Date;
} 