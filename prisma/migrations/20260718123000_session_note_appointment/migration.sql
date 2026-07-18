-- AlterTable
ALTER TABLE "session_notes" ADD COLUMN "appointmentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "session_notes_appointmentId_key" ON "session_notes"("appointmentId");
