CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "items" (
    "id" BIGSERIAL NOT NULL,
    "embedding" vector,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "items_embedding_idx" ON "items"("embedding");
