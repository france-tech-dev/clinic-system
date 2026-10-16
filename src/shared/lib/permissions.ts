import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

/** Recursos de app clínica (matriz RBAC). */
export const CLINIC_RESOURCES = [
  "patients",
  "schedule",
  "finance",
  "team",
  "clinical",
  "settings",
  "reports",
] as const;

export type ClinicResource = (typeof CLINIC_RESOURCES)[number];

export const CLINIC_ACTIONS = ["read", "create", "update", "delete"] as const;

export type ClinicAction = (typeof CLINIC_ACTIONS)[number];

export const CLINIC_RESOURCE_LABEL: Record<ClinicResource, string> = {
  patients: "Pacientes",
  schedule: "Agenda",
  finance: "Caixa",
  team: "Equipe",
  clinical: "Clínico (avaliações / anamnese)",
  settings: "Configurações",
  reports: "Relatórios",
};

const crud = ["read", "create", "update", "delete"] as const;
const readUpdate = ["read", "update"] as const;

const clinicFull = {
  patients: [...crud],
  schedule: [...crud],
  finance: [...crud],
  team: [...crud],
  clinical: [...crud],
  settings: [...crud],
  reports: [...crud],
} as const;

/** Colaborador: atendimento sem gestão de equipe/caixa/config. */
const clinicMember = {
  patients: [...readUpdate],
  schedule: [...readUpdate],
  clinical: [...readUpdate],
  reports: ["read"] as const,
} as const;

const statement = {
  ...defaultStatements,
  patients: [...crud],
  schedule: [...crud],
  finance: [...crud],
  team: [...crud],
  clinical: [...crud],
  settings: [...crud],
  reports: [...crud],
} as const;

const ac = createAccessControl(statement);

const OWNER = ac.newRole({
  ...ownerAc.statements,
  ...clinicFull,
});

const ADMIN = ac.newRole({
  ...adminAc.statements,
  ...clinicFull,
});

const MANAGER = ac.newRole({
  ...adminAc.statements,
  ...clinicFull,
});

const MEMBER = ac.newRole({
  ...memberAc.statements,
  ...clinicMember,
});

/** Portal: sem grants de painel clínico. */
const CLIENT = ac.newRole({});

export { ac, ADMIN, CLIENT, MANAGER, MEMBER, OWNER, statement };
