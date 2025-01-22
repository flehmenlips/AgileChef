import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clerk-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const boardApi = {
  // Board operations
  getBoards: () => api.get('/api/boards'),
  createBoard: (title: string) => api.post('/api/boards', { title }),

  // Column operations
  createColumn: (data: { title: string; boardId: string; order: number; limit?: number }) =>
    api.post('/api/columns', data),
  updateCardOrder: (columnId: string, cards: { id: string; order: number; columnId: string }[]) =>
    api.put(`/api/columns/${columnId}/cards`, { cards }),

  // Card operations
  createCard: (data: {
    title: string;
    description?: string;
    columnId: string;
    order: number;
    status?: string;
    instructions?: string[];
    labels?: string[];
    ingredients: { name: string; quantity: number; unit: string }[];
  }) => api.post('/api/cards', data),
  
  updateCard: (cardId: string, data: {
    title?: string;
    description?: string;
    status?: string;
    instructions?: string[];
    labels?: string[];
    ingredients?: { name: string; quantity: number; unit: string }[];
  }) => api.put(`/api/cards/${cardId}`, data),
  
  deleteCard: (cardId: string) => api.delete(`/api/cards/${cardId}`),
};

export default api; 