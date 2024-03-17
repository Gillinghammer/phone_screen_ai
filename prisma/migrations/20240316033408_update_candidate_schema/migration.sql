-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "status" SET DEFAULT 'OPEN',
ALTER COLUMN "callDuration" DROP NOT NULL,
ALTER COLUMN "questionsAnswers" DROP NOT NULL,
ALTER COLUMN "qualificationScore" DROP NOT NULL;
