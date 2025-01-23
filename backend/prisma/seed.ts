import { PrismaClient, RecipeStatus, Unit } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a user first
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        clerkId: 'test_clerk_id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }
    });

    console.log('Created test user:', user);

    // Create a board for the user
    const board = await prisma.board.create({
      data: {
        title: 'Recipe Development',
        userId: user.id,
        columns: {
          create: [
            {
              title: 'To Do',
              order: 0,
              limit: 5,
              cards: {
                create: [
                  {
                    title: 'Classic Chocolate Cake',
                    description: 'A rich, moist chocolate cake recipe',
                    status: RecipeStatus.DORMANT,
                    order: 0,
                    color: 'blue',
                    instructions: [
                      'Preheat oven to 350°F',
                      'Mix dry ingredients',
                      'Add wet ingredients',
                      'Bake for 30 minutes'
                    ],
                    labels: ['dessert', 'baking'],
                    ingredients: {
                      create: [
                        {
                          id: randomUUID(),
                          name: 'All-purpose flour',
                          quantity: 2,
                          unit: Unit.CUP
                        },
                        {
                          id: randomUUID(),
                          name: 'Sugar',
                          quantity: 1.5,
                          unit: Unit.CUP
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              title: 'In Progress',
              order: 1,
              limit: 3
            },
            {
              title: 'Testing',
              order: 2,
              limit: 3
            },
            {
              title: 'Completed',
              order: 3,
              limit: 5
            }
          ]
        }
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

    console.log('Seed data created successfully:', board);
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 