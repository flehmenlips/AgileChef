import express from 'express';
import cors from 'cors';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import boardRoutes from './routes/board';
import columnRoutes from './routes/column';
import cardRoutes from './routes/card';
import webhookRoutes from './routes/webhooks';

const app = express();

// CORS configuration
const allowedOrigins = [
  'https://agilechef.seabreeze.farm',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'svix-id', 'svix-timestamp', 'svix-signature']
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