import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../utils/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
      };
    }
  }
}

// Middleware to require authentication and attach user to request
export const requireAuth = [
  ClerkExpressRequireAuth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Attach user info to request
      req.user = {
        id: req.auth.userId,
        userId: req.auth.userId,
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
]; 