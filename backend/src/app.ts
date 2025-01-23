import express from 'express';
import cors from 'cors';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import boardRoutes from './routes/board';
import columnRoutes from './routes/column';
import cardRoutes from './routes/card';
import webhookRoutes from './routes/webhooks';

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Add Clerk authentication middleware
app.use(ClerkExpressWithAuth());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/webhooks', webhookRoutes);

export default app; 