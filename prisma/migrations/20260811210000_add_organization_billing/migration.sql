-- CreateEnum
CREATE TYPE "BillingPlan" AS ENUM ('starter', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');

-- CreateTable
CREATE TABLE "organization_billing" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" "BillingStatus" NOT NULL,
    "plan" "BillingPlan",
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_billing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_billing_organizationId_key" ON "organization_billing"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_billing_stripeCustomerId_key" ON "organization_billing"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_billing_stripeSubscriptionId_key" ON "organization_billing"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "organization_billing_stripeCustomerId_idx" ON "organization_billing"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "organization_billing" ADD CONSTRAINT "organization_billing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
