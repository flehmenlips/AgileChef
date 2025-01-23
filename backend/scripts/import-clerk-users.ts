import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function importUsers() {
  try {
    console.log('Fetching users from Clerk...');
    const clerkUsers = await clerkClient.users.getUserList();
    console.log(`Found ${clerkUsers.length} users in Clerk`);

    for (const clerkUser of clerkUsers) {
      const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (!primaryEmail) {
        console.log(`Skipping user ${clerkUser.id} - no email address`);
        continue;
      }

      console.log(`Processing user: ${clerkUser.id} (${primaryEmail})`);

      // Create or update user in our database
      await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        create: {
          id: clerkUser.id, // Using Clerk ID as our ID
          clerkId: clerkUser.id,
          email: primaryEmail,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
        },
        update: {
          email: primaryEmail,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null,
        },
      });

      console.log(`Successfully processed user: ${clerkUser.id}`);
    }

    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importUsers()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 