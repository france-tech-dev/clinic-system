-- Rename evaluation tables to match ClinicalEvaluation / ProtocolEvaluation

ALTER TABLE "evaluations" RENAME TO "clinical_evaluations";
ALTER TABLE "protocol_assessments" RENAME TO "protocol_evaluations";
