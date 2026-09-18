-- Better Auth 1.7.3+: `issuer` deixou de ser escrito; identidade volta a (providerId, accountId).
DROP INDEX IF EXISTS "accounts_issuer_accountId_key";

ALTER TABLE "accounts" DROP COLUMN IF EXISTS "issuer";

CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");
