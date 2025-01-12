-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "hiringManagerEmail" TEXT,
ADD COLUMN     "isOutbound" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "resumeUrl" DROP NOT NULL;
