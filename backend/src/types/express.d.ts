import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
        sessionId: string;
        session: {
          id: string;
          userId: string;
        };
      };
    }
  }
}

export {}; 