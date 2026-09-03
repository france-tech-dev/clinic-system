import { BillingPlan, BillingStatus } from "@prisma/enums";

export const BILLING_PLANS = [
  BillingPlan.STARTER,
  BillingPlan.PRO,
  BillingPlan.ENTERPRISE,
] as const;

export const BILLING_STATUSES = [
  BillingStatus.TRIALING,
  BillingStatus.ACTIVE,
  BillingStatus.PAST_DUE,
  BillingStatus.CANCELLED,
  BillingStatus.UNPAID,
] as const;

/** Só o que o plano corta — módulos base da clínica não entram aqui. */
export const GATED_FEATURES = [
  "anamnese",
  "caixa",
  "avaliacoes",
  "portal",
  "ai",
] as const;
export type GatedFeatureId = (typeof GATED_FEATURES)[number];

export const TRIAL_DAYS = 7;

export const BILLING_PLAN_PRICES_BRL = {
  [BillingPlan.STARTER]: 149,
  [BillingPlan.PRO]: 279,
  [BillingPlan.ENTERPRISE]: 449,
} as const satisfies Record<BillingPlan, number>;

export type BillingPlanDef = {
  id: BillingPlan;
  name: string;
  maxProfessionals: number | null;
  features: readonly GatedFeatureId[];
  highlights: readonly string[];
  priceMonthlyBrl: number;
};

export const STARTER_HIGHLIGHTS = [
  "Agenda e agendamentos",
  "Pacientes, prontuário, evoluções e PDF",
  "Profissionais da equipe",
  "Dashboard e busca",
  "Configurações da clínica",
] as const;

const PRO_HIGHLIGHTS = [
  ...STARTER_HIGHLIGHTS,
  "Anamnese por especialidade",
  "Fluxo de caixa",
] as const;

const ENTERPRISE_HIGHLIGHTS = [
  ...PRO_HIGHLIGHTS,
  "Avaliações estruturadas (GMFM-88 e protocolos de avaliação)",
  "Portal do responsável",
  "Interpretação assistida por IA (protocolos de avaliação)",
] as const;

export const BILLING_PLAN_DEFS: readonly BillingPlanDef[] = [
  {
    id: BillingPlan.STARTER,
    name: "Starter",
    maxProfessionals: 3,
    features: [],
    highlights: STARTER_HIGHLIGHTS,
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.STARTER],
  },
  {
    id: BillingPlan.PRO,
    name: "Pro",
    maxProfessionals: 9,
    features: ["anamnese", "caixa"],
    highlights: PRO_HIGHLIGHTS,
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.PRO],
  },
  {
    id: BillingPlan.ENTERPRISE,
    name: "Enterprise",
    maxProfessionals: null,
    features: ["anamnese", "caixa", "avaliacoes", "portal", "ai"],
    highlights: ENTERPRISE_HIGHLIGHTS,
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.ENTERPRISE],
  },
];

export type BillingAccessMode = "full" | "read_only";

export type BillingAccess = {
  mode: BillingAccessMode;
  status: BillingStatus | null;
  plan: BillingPlan | null;
  trialEndsAt: Date | null;
  /** Features gated incluídas (trial/legado = todas). */
  features: readonly GatedFeatureId[];
  maxProfessionals: number | null;
  isLegacy: boolean;
};

function planDef(plan: BillingPlan): BillingPlanDef {
  const def = BILLING_PLAN_DEFS.find((item) => item.id === plan);
  if (!def) throw new Error(`Plano desconhecido: ${plan}`);
  return def;
}

export function resolveBillingAccess(
  row: {
    status: BillingStatus;
    plan: BillingPlan | null;
    trialEndsAt: Date | null;
  } | null,
): BillingAccess {
  if (!row) {
    return {
      mode: "full",
      status: null,
      plan: null,
      trialEndsAt: null,
      features: GATED_FEATURES,
      maxProfessionals: null,
      isLegacy: true,
    };
  }

  if (row.status === BillingStatus.TRIALING) {
    return {
      mode: "full",
      status: row.status,
      plan: row.plan,
      trialEndsAt: row.trialEndsAt,
      features: GATED_FEATURES,
      maxProfessionals: null,
      isLegacy: false,
    };
  }

  const def = row.plan ? planDef(row.plan) : null;
  const features = def?.features ?? GATED_FEATURES;
  const maxProfessionals = def?.maxProfessionals ?? null;
  const mode =
    row.status === BillingStatus.CANCELLED ||
    row.status === BillingStatus.UNPAID
      ? "read_only"
      : "full";

  return {
    mode,
    status: row.status,
    plan: row.plan,
    trialEndsAt: row.trialEndsAt,
    features,
    maxProfessionals,
    isLegacy: false,
  };
}
