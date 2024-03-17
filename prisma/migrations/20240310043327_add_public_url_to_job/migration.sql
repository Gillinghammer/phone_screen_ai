/*
  Warnings:

  - Added the required column `publicUrl` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "publicUrl" TEXT NOT NULL;
