-- Implicit many-to-many Patient ↔ Member (nomenclatura members/patients)
-- Prisma: A = Member, B = Patient (ordem alfabética dos modelos)

CREATE TABLE "_PatientMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_PatientMembers_AB_unique" ON "_PatientMembers"("A", "B");

CREATE INDEX "_PatientMembers_B_index" ON "_PatientMembers"("B");

ALTER TABLE "_PatientMembers" ADD CONSTRAINT "_PatientMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_PatientMembers" ADD CONSTRAINT "_PatientMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preservar vínculos da tabela explícita anterior (se existirem)
INSERT INTO "_PatientMembers" ("A", "B")
SELECT "member_id", "patient_id" FROM "patient_professionals"
ON CONFLICT DO NOTHING;

DROP TABLE "patient_professionals";
