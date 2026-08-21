-- AlterTable
ALTER TABLE "protocol_evaluations" ADD COLUMN "inviteItemId" TEXT;

-- CreateTable
CREATE TABLE "protocol_invites" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdByMemberId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_invite_items" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "responses" TEXT NOT NULL DEFAULT '{}',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_invite_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "protocol_invites_token_key" ON "protocol_invites"("token");

-- CreateIndex
CREATE INDEX "protocol_invites_organizationId_idx" ON "protocol_invites"("organizationId");

-- CreateIndex
CREATE INDEX "protocol_invites_patientId_idx" ON "protocol_invites"("patientId");

-- CreateIndex
CREATE INDEX "protocol_invites_createdByMemberId_idx" ON "protocol_invites"("createdByMemberId");

-- CreateIndex
CREATE INDEX "protocol_invite_items_inviteId_idx" ON "protocol_invite_items"("inviteId");

-- CreateIndex
CREATE INDEX "protocol_invite_items_protocolId_idx" ON "protocol_invite_items"("protocolId");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_invite_items_inviteId_protocolId_key" ON "protocol_invite_items"("inviteId", "protocolId");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_evaluations_inviteItemId_key" ON "protocol_evaluations"("inviteItemId");

-- AddForeignKey
ALTER TABLE "protocol_evaluations" ADD CONSTRAINT "protocol_evaluations_inviteItemId_fkey" FOREIGN KEY ("inviteItemId") REFERENCES "protocol_invite_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_invites" ADD CONSTRAINT "protocol_invites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_invites" ADD CONSTRAINT "protocol_invites_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_invites" ADD CONSTRAINT "protocol_invites_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_invite_items" ADD CONSTRAINT "protocol_invite_items_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "protocol_invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
