import express from 'express';
import { handleClerkWebhook } from '../controllers/webhooks';

const router = express.Router();

router.post('/clerk', handleClerkWebhook);

export default router; 