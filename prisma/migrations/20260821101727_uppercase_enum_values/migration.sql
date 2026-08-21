-- Align PostgreSQL enum labels with Prisma schema (UPPERCASE).
-- Uses RENAME VALUE so existing rows keep their semantic meaning.

-- PatientStatus
ALTER TYPE "PatientStatus" RENAME VALUE 'active' TO 'ACTIVE';
ALTER TYPE "PatientStatus" RENAME VALUE 'discharged' TO 'DISCHARGED';
ALTER TYPE "PatientStatus" RENAME VALUE 'paused' TO 'PAUSED';

-- MemberStatus
ALTER TYPE "MemberStatus" RENAME VALUE 'active' TO 'ACTIVE';
ALTER TYPE "MemberStatus" RENAME VALUE 'inactive' TO 'INACTIVE';

-- SessionNoteStatus
ALTER TYPE "SessionNoteStatus" RENAME VALUE 'attended' TO 'ATTENDED';
ALTER TYPE "SessionNoteStatus" RENAME VALUE 'absent' TO 'ABSENT';
ALTER TYPE "SessionNoteStatus" RENAME VALUE 'cancelled' TO 'CANCELLED';

-- AppointmentStatus
ALTER TYPE "AppointmentStatus" RENAME VALUE 'scheduled' TO 'SCHEDULED';
ALTER TYPE "AppointmentStatus" RENAME VALUE 'completed' TO 'COMPLETED';
ALTER TYPE "AppointmentStatus" RENAME VALUE 'absent' TO 'ABSENT';
ALTER TYPE "AppointmentStatus" RENAME VALUE 'cancelled' TO 'CANCELLED';

-- CashTransactionType
ALTER TYPE "CashTransactionType" RENAME VALUE 'income' TO 'INCOME';
ALTER TYPE "CashTransactionType" RENAME VALUE 'expense' TO 'EXPENSE';

-- CashPaymentMethod
ALTER TYPE "CashPaymentMethod" RENAME VALUE 'cash' TO 'CASH';
ALTER TYPE "CashPaymentMethod" RENAME VALUE 'pix' TO 'PIX';
ALTER TYPE "CashPaymentMethod" RENAME VALUE 'card' TO 'CARD';
ALTER TYPE "CashPaymentMethod" RENAME VALUE 'transfer' TO 'TRANSFER';
ALTER TYPE "CashPaymentMethod" RENAME VALUE 'other' TO 'OTHER';

-- PatientPricingType
ALTER TYPE "PatientPricingType" RENAME VALUE 'session' TO 'SESSION';
ALTER TYPE "PatientPricingType" RENAME VALUE 'package' TO 'PACKAGE';

-- PatientSex
ALTER TYPE "PatientSex" RENAME VALUE 'female' TO 'FEMALE';
ALTER TYPE "PatientSex" RENAME VALUE 'male' TO 'MALE';
ALTER TYPE "PatientSex" RENAME VALUE 'other' TO 'OTHER';
ALTER TYPE "PatientSex" RENAME VALUE 'not_informed' TO 'NOT_INFORMED';

-- BillingPlan
ALTER TYPE "BillingPlan" RENAME VALUE 'starter' TO 'STARTER';
ALTER TYPE "BillingPlan" RENAME VALUE 'pro' TO 'PRO';
ALTER TYPE "BillingPlan" RENAME VALUE 'enterprise' TO 'ENTERPRISE';

-- BillingStatus (Stripe uses "canceled"; Prisma/app use CANCELLED)
ALTER TYPE "BillingStatus" RENAME VALUE 'trialing' TO 'TRIALING';
ALTER TYPE "BillingStatus" RENAME VALUE 'active' TO 'ACTIVE';
ALTER TYPE "BillingStatus" RENAME VALUE 'past_due' TO 'PAST_DUE';
ALTER TYPE "BillingStatus" RENAME VALUE 'canceled' TO 'CANCELLED';
ALTER TYPE "BillingStatus" RENAME VALUE 'unpaid' TO 'UNPAID';
