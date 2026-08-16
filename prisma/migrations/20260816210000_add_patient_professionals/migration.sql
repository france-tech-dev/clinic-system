-- CreateTable
CREATE TABLE "patient_professionals" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_professionals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_professionals_member_id_idx" ON "patient_professionals"("member_id");

-- CreateIndex
CREATE INDEX "patient_professionals_patient_id_idx" ON "patient_professionals"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_professionals_patient_id_member_id_key" ON "patient_professionals"("patient_id", "member_id");

-- AddForeignKey
ALTER TABLE "patient_professionals" ADD CONSTRAINT "patient_professionals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_professionals" ADD CONSTRAINT "patient_professionals_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
