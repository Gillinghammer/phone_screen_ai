/*
  Warnings:

  - You are about to drop the column `callDuration` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `qualificationScore` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `questionsAnswers` on the `Candidate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "callDuration",
DROP COLUMN "qualificationScore",
DROP COLUMN "questionsAnswers";
