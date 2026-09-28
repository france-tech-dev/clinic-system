-- AlterTable
ALTER TABLE "patients" DROP CONSTRAINT "patients_guardianId_fkey";

ALTER TABLE "patients" ALTER COLUMN "guardianId" DROP NOT NULL;

ALTER TABLE "patients" ADD CONSTRAINT "patients_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
