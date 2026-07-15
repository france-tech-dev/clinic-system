-- AlterTable
ALTER TABLE "member" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ativo';

-- CreateIndex
CREATE INDEX "member_organizationId_status_idx" ON "member"("organizationId", "status");
