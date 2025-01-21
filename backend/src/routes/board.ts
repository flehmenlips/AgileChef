import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../utils/prisma';
import { CreateBoardRequest, UpdateColumnOrderRequest } from '../types/api';

const router = express.Router();

// Get all boards for the authenticated user
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        userId: req.auth.userId
      },
      include: {
        columns: {
          include: {
            cards: {
              include: {
                ingredients: true
              }
            }
          }
        }
      }
    });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Create a new board
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  const { title } = req.body as CreateBoardRequest;
  try {
    const board = await prisma.board.create({
      data: {
        title,
        userId: req.auth.userId
      }
    });
    res.json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update board columns order
router.put('/:boardId/columns', ClerkExpressRequireAuth(), async (req, res) => {
  const { boardId } = req.params;
  const { columns } = req.body as UpdateColumnOrderRequest;
  
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

    // Update each column's order
    await Promise.all(
      columns.map((column) =>
        prisma.column.update({
          where: { id: column.id },
          data: { order: column.order }
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating column order:', error);
    res.status(500).json({ error: 'Failed to update column order' });
  }
});

// Delete a board
router.delete('/:boardId', ClerkExpressRequireAuth(), async (req, res) => {
  const { boardId } = req.params;
  
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

    await prisma.board.delete({
      where: { id: boardId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

export default router; 