/*
  Warnings:

  - The values [ACTIVE,COMPLETED] on the enum `RecipeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RecipeStatus_new" AS ENUM ('FULLY_STOCKED', 'OUT_OF_STOCK', 'LOW_STOCK', 'DORMANT');
ALTER TABLE "Card" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Card" ALTER COLUMN "status" TYPE "RecipeStatus_new" USING ("status"::text::"RecipeStatus_new");
ALTER TYPE "RecipeStatus" RENAME TO "RecipeStatus_old";
ALTER TYPE "RecipeStatus_new" RENAME TO "RecipeStatus";
DROP TYPE "RecipeStatus_old";
ALTER TABLE "Card" ALTER COLUMN "status" SET DEFAULT 'DORMANT';
COMMIT;
