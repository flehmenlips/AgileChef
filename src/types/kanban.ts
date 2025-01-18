export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
}

export interface Ingredient {
  id: string;
  quantity: number;
  unit: 'g' | 'oz' | 'cup' | 'tbsp' | 'tsp' | 'lb' | 'kg' | 'ml' | 'l' | 'piece' | 'pinch';
  name: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  ingredients: Ingredient[];
  instructions: string[];
  status: 'fully-stocked' | 'low-stock' | 'out-of-stock' | 'in-progress' | 'dormant';
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