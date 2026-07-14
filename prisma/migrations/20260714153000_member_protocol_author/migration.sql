-- AlterTable
ALTER TABLE "member" ADD COLUMN "metadata" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_protocol_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "memberId" TEXT,
    "protocolId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Avaliação',
    "date" TEXT NOT NULL,
    "scores" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "protocol_assessments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protocol_assessments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protocol_assessments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_protocol_assessments" ("createdAt", "date", "id", "label", "notes", "organizationId", "patientId", "protocolId", "scores", "updatedAt") SELECT "createdAt", "date", "id", "label", "notes", "organizationId", "patientId", "protocolId", "scores", "updatedAt" FROM "protocol_assessments";
DROP TABLE "protocol_assessments";
ALTER TABLE "new_protocol_assessments" RENAME TO "protocol_assessments";
CREATE INDEX "protocol_assessments_organizationId_idx" ON "protocol_assessments"("organizationId");
CREATE INDEX "protocol_assessments_patientId_idx" ON "protocol_assessments"("patientId");
CREATE INDEX "protocol_assessments_patientId_protocolId_idx" ON "protocol_assessments"("patientId", "protocolId");
CREATE INDEX "protocol_assessments_memberId_idx" ON "protocol_assessments"("memberId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
