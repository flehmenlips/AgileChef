import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../utils/prisma';
import { CreateColumnRequest, UpdateCardOrderRequest } from '../types/api';

const router = express.Router();

// Create a new column
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  const { title, boardId, order, limit } = req.body as CreateColumnRequest;
  try {
    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId: req.auth.userId
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const column = await prisma.column.create({
      data: {
        title,
        boardId,
        order,
        limit
      }
    });
    res.json(column);
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
});

// Update column cards order
router.put('/:columnId/cards', ClerkExpressRequireAuth(), async (req, res) => {
  const { columnId } = req.params;
  const { cards } = req.body as UpdateCardOrderRequest;
  
  try {
    // Verify column ownership through board
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          userId: req.auth.userId
        }
      }
    });

    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }

    // Update each card's order and column
    await Promise.all(
      cards.map((card) =>
        prisma.card.update({
          where: { id: card.id },
          data: { 
            order: card.order,
            columnId: card.columnId
          }
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating card order:', error);
    res.status(500).json({ error: 'Failed to update card order' });
  }
});

// Delete a column
router.delete('/:columnId', ClerkExpressRequireAuth(), async (req, res) => {
  const { columnId } = req.params;
  
  try {
    // Verify column ownership through board
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          userId: req.auth.userId
        }
      }
    });

    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }

    await prisma.column.delete({
      where: { id: columnId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

export default router; 