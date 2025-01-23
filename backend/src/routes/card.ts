import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { prisma } from '../utils/prisma';
import { CreateCardRequest, UpdateCardRequest } from '../types/api';
import { randomUUID } from 'crypto';

const router = express.Router();

// Create a new recipe card
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  console.log('=== Card Creation Attempt ===');
  console.log('Request received at:', new Date().toISOString());
  console.log('User ID:', req.auth.userId);
  console.log('Incoming request body:', req.body);
  
  const { title, description, columnId, order, color, ingredients, status, instructions, labels } = req.body as CreateCardRequest;
  try {
    // Verify column ownership through board
    console.log('Verifying column ownership for columnId:', columnId);
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

    console.log('Column found, creating card...');
    const card = await prisma.card.create({
      data: {
        title,
        description: description || '',
        columnId,
        order: order || 0,
        status: status || 'DORMANT',
        instructions: instructions || [],
        labels: labels || [],
        ingredients: ingredients?.length ? {
          create: ingredients.map((ingredient) => ({
            id: randomUUID(),
            name: ingredient.name,
            quantity: ingredient.quantity || 0,
            unit: ingredient.unit
          }))
        } : undefined
      },
      include: {
        ingredients: true
      }
    });
    
    console.log('Card created successfully:', card);
    res.json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('code' in error) {
        console.error('Prisma error code:', (error as any).code);
      }
    }
    res.status(500).json({ error: 'Failed to create card', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Update a recipe card
router.put('/:cardId', ClerkExpressRequireAuth(), async (req, res) => {
  console.log('=== Card Update Attempt ===');
  console.log('Request received at:', new Date().toISOString());
  console.log('User ID:', req.auth.userId);
  console.log('Card ID:', req.params.cardId);
  console.log('Incoming request body:', req.body);
  
  const { cardId } = req.params;
  const updateData = req.body as UpdateCardRequest;
  
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
      console.log('Card not found:', cardId);
      return res.status(404).json({ error: 'Card not found' });
    }

    // Delete existing ingredients if new ones are provided
    if (updateData.ingredients) {
      console.log('Deleting existing ingredients for card:', cardId);
      await prisma.ingredient.deleteMany({
        where: { cardId }
      });
    }

    // Prepare update data
    const data: any = {
      title: updateData.title,
      description: updateData.description,
      status: updateData.status,
      instructions: updateData.instructions,
      labels: updateData.labels,
      columnId: updateData.columnId,
      order: updateData.order
    };

    // Only include defined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    // Add ingredients if provided
    if (updateData.ingredients) {
      data.ingredients = {
        create: updateData.ingredients.map((ingredient) => ({
          id: randomUUID(),
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        }))
      };
    }

    console.log('Updating card with data:', data);

    // Update card and create new ingredients
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data,
      include: {
        ingredients: true
      }
    });

    console.log('Card updated successfully:', updatedCard);
    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('code' in error) {
        console.error('Prisma error code:', (error as any).code);
      }
    }
    res.status(500).json({ 
      error: 'Failed to update card',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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