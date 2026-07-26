-- Rename roteiro id "si" → "integracao-sensorial" on existing notes
UPDATE "roteiro_notes"
SET "roteiroId" = 'integracao-sensorial'
WHERE "roteiroId" = 'si';
