export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  labels?: string[];
  assignees?: string[];
  priority?: 'low' | 'medium' | 'high';
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