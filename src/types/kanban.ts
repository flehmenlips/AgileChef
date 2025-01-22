export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
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
  DORMANT = 'DORMANT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
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