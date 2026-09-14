-- BillingPlan: STARTER → SOLO
ALTER TYPE "BillingPlan" RENAME VALUE 'STARTER' TO 'SOLO';

-- Extra seats beyond plan included professionals
ALTER TABLE "organization_billing" ADD COLUMN "extraSeats" INTEGER NOT NULL DEFAULT 0;
