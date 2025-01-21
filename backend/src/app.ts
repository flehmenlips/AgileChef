import express from 'express';
import cors from 'cors';
import webhookRoutes from './routes/webhooks';
import boardRoutes from './routes/board';
import columnRoutes from './routes/column';
import cardRoutes from './routes/card';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/cards', cardRoutes);

export default app; 