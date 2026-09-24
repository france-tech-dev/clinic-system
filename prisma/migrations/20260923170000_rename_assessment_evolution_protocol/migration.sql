-- Rename enum SessionNoteStatus → EvolutionStatus
ALTER TYPE "SessionNoteStatus" RENAME TO "EvolutionStatus";

-- Rename tables
ALTER TABLE "clinical_evaluations" RENAME TO "assessments";
ALTER TABLE "session_notes" RENAME TO "evolutions";
ALTER TABLE "protocol_evaluations" RENAME TO "protocol_assessments";
