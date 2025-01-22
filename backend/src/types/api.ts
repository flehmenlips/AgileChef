import { RecipeStatus, Unit } from '@prisma/client';

// Board types
export interface CreateBoardRequest {
  title: string;
}

export interface UpdateColumnOrderRequest {
  columns: {
    id: string;
    order: number;
  }[];
}

// Column types
export interface CreateColumnRequest {
  title: string;
  boardId: string;
  order: number;
  limit?: number;
}

export interface UpdateColumnRequest {
  title?: string;
  limit?: number;
}

export interface UpdateCardOrderRequest {
  cards: {
    id: string;
    order: number;
    columnId: string;
  }[];
}

// Card types
export interface CreateCardRequest {
  title: string;
  description?: string;
  columnId: string;
  order: number;
  color?: string;
  status?: RecipeStatus;
  instructions?: string[];
  labels?: string[];
  ingredients: CreateIngredientRequest[];
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  color?: string;
  status?: RecipeStatus;
  instructions?: string[];
  labels?: string[];
  ingredients?: CreateIngredientRequest[];
  columnId?: string;
  order?: number;
}

// Ingredient types
export interface CreateIngredientRequest {
  name: string;
  quantity: number;
  unit: Unit;
} 