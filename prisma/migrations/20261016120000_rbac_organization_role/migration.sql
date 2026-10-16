-- Member.role: enum Role → text (permite roles dinâmicas por clínica)
ALTER TABLE "member" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "member" ALTER COLUMN "role" TYPE TEXT USING ("role"::text);
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- Tabela Better Auth dynamicAccessControl
CREATE TABLE "organizationRole" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "organizationRole_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "organizationRole_organizationId_idx" ON "organizationRole"("organizationId");
CREATE UNIQUE INDEX "organizationRole_organizationId_role_key" ON "organizationRole"("organizationId", "role");

ALTER TABLE "organizationRole" ADD CONSTRAINT "organizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enum Role permanece no schema Prisma para constantes TS; já não tipa a coluna.
