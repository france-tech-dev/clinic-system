-- Better Auth 1.7: identidade de conta passa a ser (issuer, accountId).
ALTER TABLE "accounts" ADD COLUMN "issuer" TEXT;

UPDATE "accounts"
SET "issuer" = 'local:credential'
WHERE "providerId" = 'credential' AND "issuer" IS NULL;

UPDATE "accounts"
SET "issuer" = 'https://accounts.google.com'
WHERE "providerId" = 'google' AND "issuer" IS NULL;

UPDATE "accounts"
SET "issuer" = 'local:oauth:' || "providerId"
WHERE "issuer" IS NULL;

ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;

DROP INDEX "accounts_providerId_accountId_key";

CREATE UNIQUE INDEX "accounts_issuer_accountId_key" ON "accounts"("issuer", "accountId");
