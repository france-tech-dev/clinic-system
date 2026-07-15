-- AlterTable
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "birth_date" DATETIME;
ALTER TABLE "users" ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "member" ADD COLUMN "profession" TEXT;
ALTER TABLE "member" ADD COLUMN "registro" TEXT;
