-- CreateEnum
CREATE TYPE "CashTransactionStatus" AS ENUM ('POSTED', 'FORECAST');

-- AlterTable
ALTER TABLE "cash_transactions" ADD COLUMN     "status" "CashTransactionStatus" NOT NULL DEFAULT 'POSTED';

-- AlterTable
ALTER TABLE "invitation" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "cash_transactions_organizationId_status_idx" ON "cash_transactions"("organizationId", "status");
