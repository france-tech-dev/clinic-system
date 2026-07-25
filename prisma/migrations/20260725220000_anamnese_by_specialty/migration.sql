-- Redefine anamneses: formId + organizationId, unique(patientId, formId)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_anamneses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "anamneses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "anamneses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_anamneses" ("id", "organizationId", "patientId", "formId", "data", "createdAt", "updatedAt")
SELECT a."id", p."organizationId", a."patientId", 'anamnese-to', a."data", a."createdAt", a."updatedAt"
FROM "anamneses" a
INNER JOIN "patients" p ON p."id" = a."patientId";
DROP TABLE "anamneses";
ALTER TABLE "new_anamneses" RENAME TO "anamneses";
CREATE UNIQUE INDEX "anamneses_patientId_formId_key" ON "anamneses"("patientId", "formId");
CREATE INDEX "anamneses_organizationId_idx" ON "anamneses"("organizationId");
CREATE INDEX "anamneses_patientId_idx" ON "anamneses"("patientId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
