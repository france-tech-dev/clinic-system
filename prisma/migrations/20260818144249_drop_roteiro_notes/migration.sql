/*
  Warnings:

  - You are about to drop the `roteiro_notes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "roteiro_notes" DROP CONSTRAINT "roteiro_notes_patientId_fkey";

-- AlterTable
ALTER TABLE "_PatientMembers" ADD CONSTRAINT "_PatientMembers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PatientMembers_AB_unique";

-- DropTable
DROP TABLE "roteiro_notes";
