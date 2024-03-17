/*
  Warnings:

  - Added the required column `callId` to the `PhoneScreen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobId` to the `PhoneScreen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhoneScreen" ADD COLUMN     "answeredBy" TEXT,
ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "callId" TEXT NOT NULL,
ADD COLUMN     "callLength" DOUBLE PRECISION,
ADD COLUMN     "completed" BOOLEAN,
ADD COLUMN     "concatenatedTranscript" TEXT,
ADD COLUMN     "correctedDuration" INTEGER,
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "endpointUrl" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "from" TEXT,
ADD COLUMN     "inbound" BOOLEAN,
ADD COLUMN     "jobId" INTEGER NOT NULL,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "maxDuration" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "queueStatus" TEXT,
ADD COLUMN     "record" BOOLEAN,
ADD COLUMN     "recordingUrl" TEXT,
ADD COLUMN     "requestPhoneNumber" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "to" TEXT,
ADD COLUMN     "transcripts" JSONB,
ADD COLUMN     "variables" JSONB,
ADD COLUMN     "wait" BOOLEAN,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "PhoneScreen" ADD CONSTRAINT "PhoneScreen_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
