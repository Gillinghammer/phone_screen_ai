/*
  Warnings:

  - You are about to drop the column `analysis_v2` on the `PhoneScreen` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PhoneScreen" DROP COLUMN "analysis_v2",
ADD COLUMN     "analysisV2" JSONB;
