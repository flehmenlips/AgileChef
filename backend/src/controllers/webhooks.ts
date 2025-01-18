import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../utils/prisma';
import { WebhookEvent } from '@clerk/clerk-sdk-node';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const headers = req.headers;
  const payload = req.body;

  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      headers as Record<string, string>
    ) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return res.status(400).json({ error: 'No email address provided' });
      }

      await prisma.user.upsert({
        where: { clerkId },
        create: {
          id: clerkId,
          clerkId,
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
        update: {
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
      });
    }

    if (eventType === 'user.deleted') {
      await prisma.user.delete({
        where: { clerkId: id },
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(500).json({ error: 'Error processing webhook' });
  }
}; 