-- CreateTable
CREATE TABLE "PilotProgramApplicant" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "weeklyApplicants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PilotProgramApplicant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PilotProgramApplicant_email_key" ON "PilotProgramApplicant"("email");
