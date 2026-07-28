-- Align stored identifiers and column names to English

-- Patient enums
UPDATE "patients" SET "status" = 'active' WHERE "status" = 'ativo';
UPDATE "patients" SET "status" = 'discharged' WHERE "status" = 'alta';
UPDATE "patients" SET "status" = 'paused' WHERE "status" = 'pausado';
UPDATE "patients" SET "pricingType" = 'session' WHERE "pricingType" = 'sessao';
UPDATE "patients" SET "pricingType" = 'package' WHERE "pricingType" = 'pacote';
UPDATE "patients" SET "sex" = 'female' WHERE "sex" = 'feminino';
UPDATE "patients" SET "sex" = 'male' WHERE "sex" = 'masculino';
UPDATE "patients" SET "sex" = 'other' WHERE "sex" = 'outro';
UPDATE "patients" SET "sex" = 'not_informed' WHERE "sex" = 'nao_informado';

-- Member enums
UPDATE "member" SET "status" = 'active' WHERE "status" = 'ativo';
UPDATE "member" SET "status" = 'inactive' WHERE "status" = 'inativo';

-- Session note enums
UPDATE "session_notes" SET "status" = 'attended' WHERE "status" = 'compareceu';
UPDATE "session_notes" SET "status" = 'absent' WHERE "status" = 'faltou';
UPDATE "session_notes" SET "status" = 'cancelled' WHERE "status" = 'cancelado';

-- Appointment enums
UPDATE "appointments" SET "status" = 'scheduled' WHERE "status" = 'agendado';
UPDATE "appointments" SET "status" = 'completed' WHERE "status" = 'realizado';
UPDATE "appointments" SET "status" = 'absent' WHERE "status" = 'faltou';
UPDATE "appointments" SET "status" = 'cancelled' WHERE "status" = 'cancelado';

-- Cash transaction enums
UPDATE "cash_transactions" SET "type" = 'income' WHERE "type" = 'entrada';
UPDATE "cash_transactions" SET "type" = 'expense' WHERE "type" = 'saida';
UPDATE "cash_transactions" SET "paymentMethod" = 'cash' WHERE "paymentMethod" = 'dinheiro';
UPDATE "cash_transactions" SET "paymentMethod" = 'card' WHERE "paymentMethod" = 'cartao';
UPDATE "cash_transactions" SET "paymentMethod" = 'transfer' WHERE "paymentMethod" = 'transferencia';
UPDATE "cash_transactions" SET "paymentMethod" = 'other' WHERE "paymentMethod" = 'outro';

-- Evaluation columns
ALTER TABLE "evaluations" RENAME COLUMN "tipo" TO "type";
ALTER TABLE "evaluations" RENAME COLUMN "queixa" TO "complaint";
ALTER TABLE "evaluations" RENAME COLUMN "historia" TO "history";
ALTER TABLE "evaluations" RENAME COLUMN "objetivos" TO "goals";
ALTER TABLE "evaluations" RENAME COLUMN "condutas" TO "interventions";
ALTER TABLE "evaluations" RENAME COLUMN "diagnostico" TO "diagnosis";
ALTER TABLE "evaluations" RENAME COLUMN "encaminhadoPor" TO "referredBy";
ALTER TABLE "evaluations" RENAME COLUMN "contextoFamiliar" TO "familyContext";
ALTER TABLE "evaluations" RENAME COLUMN "nivelPrevio" TO "previousLevel";
ALTER TABLE "evaluations" RENAME COLUMN "medicacoes" TO "medications";
ALTER TABLE "evaluations" RENAME COLUMN "precaucoes" TO "precautions";
ALTER TABLE "evaluations" RENAME COLUMN "equipamentos" TO "equipment";
ALTER TABLE "evaluations" RENAME COLUMN "frequencia" TO "frequency";
ALTER TABLE "evaluations" RENAME COLUMN "criteriosAlta" TO "dischargeCriteria";

UPDATE "evaluations" SET "type" = 'initial' WHERE lower("type") = 'inicial';

-- Session note columns
ALTER TABLE "session_notes" RENAME COLUMN "atividades" TO "activities";
ALTER TABLE "session_notes" RENAME COLUMN "observacoes" TO "observations";

-- Member column
ALTER TABLE "member" RENAME COLUMN "registro" TO "registration";

-- Roteiro ids
UPDATE "roteiro_notes" SET "roteiroId" = 'sensory-integration' WHERE "roteiroId" IN ('si', 'integracao-sensorial');
UPDATE "roteiro_notes" SET "roteiroId" = 'fine-motor' WHERE "roteiroId" = 'grafomotor';
UPDATE "roteiro_notes" SET "roteiroId" = 'feeding-selectivity' WHERE "roteiroId" = 'alimentacao';

-- Evaluation domain category ids (JSON)
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"fina"', '"categoryId":"fine-motor"');
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"grossa"', '"categoryId":"gross-motor"');
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"cognicao"', '"categoryId":"cognition"');
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"avd"', '"categoryId":"adl"');
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"sensorial"', '"categoryId":"sensory"');
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"coordenacao"', '"categoryId":"coordination"');
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"comunicacao"', '"categoryId":"communication"');
UPDATE "evaluations" SET "domains" = REPLACE("domains", '"categoryId":"participacao"', '"categoryId":"participation"');

-- Member professional metadata JSON keys
UPDATE "member" SET "metadata" = REPLACE("metadata", '"nome"', '"name"') WHERE "metadata" IS NOT NULL;
UPDATE "member" SET "metadata" = REPLACE("metadata", '"registro"', '"registration"') WHERE "metadata" IS NOT NULL;
UPDATE "organization" SET "metadata" = REPLACE("metadata", '"nome"', '"name"') WHERE "metadata" IS NOT NULL;
UPDATE "organization" SET "metadata" = REPLACE("metadata", '"registro"', '"registration"') WHERE "metadata" IS NOT NULL;
UPDATE "organization" SET "metadata" = REPLACE("metadata", '"clinica"', '"clinic"') WHERE "metadata" IS NOT NULL;
