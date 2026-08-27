-- CreateTable
CREATE TABLE "ai_generation_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "evaluationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_generation_logs_organizationId_createdAt_idx" ON "ai_generation_logs"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_generation_logs_userId_createdAt_idx" ON "ai_generation_logs"("userId", "createdAt");
