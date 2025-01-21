import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../utils/prisma';
import { CreateCardRequest, UpdateCardRequest } from '../types/api';

const router = express.Router();

// Create a new recipe card
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  console.log('Incoming request body:', req.body);
  const { title, description, columnId, order, color, ingredients, status, instructions, labels } = req.body as CreateCardRequest;
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
      console.log('Column not found for columnId:', columnId);
      return res.status(404).json({ error: 'Column not found' });
    }

    const card = await prisma.card.create({
      data: {
        title,
        description,
        columnId,
        order,
        status,
        instructions: instructions || [],
        labels: labels || [],
        ingredients: {
          create: ingredients.map((ingredient) => ({
            id: crypto.randomUUID(),
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit
          }))
        }
      },
      include: {
        ingredients: true
      }
    });
    console.log('Card created successfully:', card);
    res.json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update a recipe card
router.put('/:cardId', ClerkExpressRequireAuth(), async (req, res) => {
  const { cardId } = req.params;
  const { title, description, status, instructions, labels, ingredients } = req.body as UpdateCardRequest;
  
  try {
    // Verify card ownership through board
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        column: {
          board: {
            userId: req.auth.userId
          }
        }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Delete existing ingredients if new ones are provided
    if (ingredients) {
      await prisma.ingredient.deleteMany({
        where: { cardId }
      });
    }

    // Update card and create new ingredients
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(instructions && { instructions }),
        ...(labels && { labels }),
        ...(ingredients && {
          ingredients: {
            create: ingredients.map((ingredient) => ({
              id: crypto.randomUUID(),
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit
            }))
          }
        })
      },
      include: {
        ingredients: true
      }
    });

    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a recipe card
router.delete('/:cardId', ClerkExpressRequireAuth(), async (req, res) => {
  const { cardId } = req.params;
  
  try {
    // Verify card ownership through board
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        column: {
          board: {
            userId: req.auth.userId
          }
        }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await prisma.card.delete({
      where: { id: cardId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

export default router; 