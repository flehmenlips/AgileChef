/*
  Warnings:

  - You are about to drop the column `description` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Label` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BoardMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CardAssignees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CardToLabel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DORMANT', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('G', 'KG', 'ML', 'L', 'TSP', 'TBSP', 'CUP', 'PIECE', 'PINCH');

-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_cardId_fkey";

-- DropForeignKey
ALTER TABLE "_BoardMembers" DROP CONSTRAINT "_BoardMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_BoardMembers" DROP CONSTRAINT "_BoardMembers_B_fkey";

-- DropForeignKey
ALTER TABLE "_CardAssignees" DROP CONSTRAINT "_CardAssignees_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardAssignees" DROP CONSTRAINT "_CardAssignees_B_fkey";

-- DropForeignKey
ALTER TABLE "_CardToLabel" DROP CONSTRAINT "_CardToLabel_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardToLabel" DROP CONSTRAINT "_CardToLabel_B_fkey";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "description",
DROP COLUMN "isPublic",
DROP COLUMN "name",
DROP COLUMN "ownerId",
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "dueDate",
DROP COLUMN "priority",
ADD COLUMN     "instructions" TEXT[],
ADD COLUMN     "labels" TEXT[],
ADD COLUMN     "status" "RecipeStatus" NOT NULL DEFAULT 'DORMANT';

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Label";

-- DropTable
DROP TABLE "_BoardMembers";

-- DropTable
DROP TABLE "_CardAssignees";

-- DropTable
DROP TABLE "_CardToLabel";

-- DropEnum
DROP TYPE "Priority";

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL,
    "name" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
