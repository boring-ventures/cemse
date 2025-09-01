/*
  Warnings:

  - You are about to drop the column `price` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "price",
ALTER COLUMN "is_mandatory" DROP NOT NULL,
ALTER COLUMN "is_active" DROP NOT NULL,
ALTER COLUMN "certification" DROP NOT NULL;
