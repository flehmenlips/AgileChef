import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { validateRequest } from '../middleware/validateRequest';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = Router();

// Organization schemas
const createOrgSchema = z.object({
  body: z.object({
    clerkId: z.string(),
    name: z.string().min(1),
    slug: z.string().min(1),
    type: z.enum([
      'RESTAURANT',
      'CATERING',
      'FOOD_TRUCK',
      'BAKERY',
      'PRIVATE_KITCHEN',
      'CULINARY_SCHOOL',
      'OTHER',
    ]),
    cuisine: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
  }),
});

const updateOrgSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    type: z
      .enum([
        'RESTAURANT',
        'CATERING',
        'FOOD_TRUCK',
        'BAKERY',
        'PRIVATE_KITCHEN',
        'CULINARY_SCHOOL',
        'OTHER',
      ])
      .optional(),
    cuisine: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
  }),
});

// Get user's organizations
router.get('/me', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organizationMember.findMany({
      where: {
        userId: req.auth.userId,
      },
      include: {
        organization: true,
      },
    });

    res.json(
      organizations.map((member) => ({
        ...member.organization,
        role: member.role,
        title: member.title,
      }))
    );
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Create organization
router.post(
  '/',
  ClerkExpressRequireAuth(),
  validateRequest(createOrgSchema),
  async (req: Request, res: Response) => {
    try {
      const org = await prisma.organization.create({
        data: {
          ...req.body,
          members: {
            create: {
              userId: req.auth.userId,
              role: 'OWNER',
            },
          },
        },
        include: {
          members: true,
        },
      });

      res.json(org);
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ error: 'Failed to create organization' });
    }
  }
);

// Update organization
router.put(
  '/:id',
  ClerkExpressRequireAuth(),
  validateRequest(updateOrgSchema),
  async (req: Request, res: Response) => {
    try {
      // Check if user has permission
      const member = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: req.auth.userId,
            organizationId: req.params.id,
          },
        },
      });

      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const org = await prisma.organization.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(org);
    } catch (error) {
      console.error('Error updating organization:', error);
      res.status(500).json({ error: 'Failed to update organization' });
    }
  }
);

// Delete organization
router.delete('/:id', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    // Check if user has permission
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.auth.userId,
          organizationId: req.params.id,
        },
      },
    });

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await prisma.organization.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// Add member to organization
router.post('/:id/members', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId, role = 'MEMBER', title } = req.body;

    // Check if user has permission
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.auth.userId,
          organizationId: req.params.id,
        },
      },
    });

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const newMember = await prisma.organizationMember.create({
      data: {
        userId,
        organizationId: req.params.id,
        role,
        title,
      },
    });

    res.json(newMember);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Error adding member:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
});

// Remove member from organization
router.delete(
  '/:id/members/:userId',
  ClerkExpressRequireAuth(),
  async (req: Request, res: Response) => {
    try {
      // Check if user has permission
      const member = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: req.auth.userId,
            organizationId: req.params.id,
          },
        },
      });

      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      await prisma.organizationMember.delete({
        where: {
          userId_organizationId: {
            userId: req.params.userId,
            organizationId: req.params.id,
          },
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing member:', error);
      res.status(500).json({ error: 'Failed to remove member' });
    }
  }
);

export default router; 