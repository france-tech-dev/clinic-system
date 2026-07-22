-- CreateTable
CREATE TABLE "guardians" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "cpf" TEXT,
    "address" TEXT NOT NULL DEFAULT '',
    "zip_code" TEXT NOT NULL DEFAULT '',
    "document_image_url" TEXT,
    "insurance" TEXT NOT NULL DEFAULT 'particular',
    "mother_name" TEXT NOT NULL DEFAULT '',
    "mother_cpf" TEXT,
    "father_name" TEXT NOT NULL DEFAULT '',
    "father_cpf" TEXT,
    "user_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "guardians_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "guardians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Backfill: one placeholder guardian per existing patient
INSERT INTO "guardians" (
    "id",
    "organizationId",
    "name",
    "phone",
    "address",
    "zip_code",
    "insurance",
    "mother_name",
    "father_name",
    "createdAt",
    "updatedAt"
)
SELECT
    'g_' || "id",
    "organizationId",
    'A definir',
    '',
    '',
    '',
    'particular',
    '',
    '',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "patients";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" DATETIME,
    "sex" TEXT NOT NULL DEFAULT 'nao_informado',
    "photo_url" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "pricingType" TEXT NOT NULL DEFAULT 'sessao',
    "priceCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "patients_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "patients_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardians" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_patients" (
    "createdAt",
    "id",
    "name",
    "notes",
    "organizationId",
    "priceCents",
    "pricingType",
    "status",
    "updatedAt",
    "guardianId",
    "sex"
)
SELECT
    "createdAt",
    "id",
    "name",
    "notes",
    "organizationId",
    "priceCents",
    "pricingType",
    "status",
    "updatedAt",
    'g_' || "id",
    'nao_informado'
FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE INDEX "patients_organizationId_idx" ON "patients"("organizationId");
CREATE INDEX "patients_organizationId_status_idx" ON "patients"("organizationId", "status");
CREATE INDEX "patients_guardianId_idx" ON "patients"("guardianId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "guardians_user_id_key" ON "guardians"("user_id");

-- CreateIndex
CREATE INDEX "guardians_organizationId_idx" ON "guardians"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_organizationId_cpf_key" ON "guardians"("organizationId", "cpf");
