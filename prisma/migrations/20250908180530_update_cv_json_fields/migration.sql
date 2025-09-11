/*
  Warnings:

  - The `skills` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interests` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "social_links" JSONB,
DROP COLUMN "skills",
ADD COLUMN     "skills" JSONB,
DROP COLUMN "interests",
ADD COLUMN     "interests" JSONB;
