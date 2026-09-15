import { BillingPlan, BillingStatus } from "@prisma/enums";

export const BILLING_PLANS = [
  BillingPlan.SOLO,
  BillingPlan.PRO,
  BillingPlan.ENTERPRISE,
] as const;

export const TRIAL_DAYS = 7;

export const EXTRA_SEAT_PRICE_BRL = 59;

export const BILLING_PLAN_PRICES_BRL = {
  [BillingPlan.SOLO]: 99,
  [BillingPlan.PRO]: 229,
  [BillingPlan.ENTERPRISE]: 599,
} as const satisfies Record<BillingPlan, number>;

export type BillingPlanDef = {
  id: BillingPlan;
  name: string;
  tagline: string;
  includedProfessionals: number;
  extraSeatAllowed: boolean;
  /** Diferenciais de tamanho/assentos — features comuns ficam em INCLUDED_IN_ALL_PLANS. */
  highlights: readonly string[];
  priceMonthlyBrl: number;
  recommended?: boolean;
};

/** Funcionalidades comuns a todos os planos — apresentar uma vez acima dos cards. */
export const INCLUDED_IN_ALL_PLANS = [
  "Agenda, pacientes, prontuário, evoluções e PDF",
  "Anamnese, avaliações, caixa e portal do responsável",
  "Interpretação assistida por IA (protocolos)",
  "Dashboard, busca e configurações da clínica",
] as const;

/** Título do bloco de recursos comuns (landing e /planos). */
export const INCLUDED_SECTION_TITLE =
  "Funcionalidades disponíveis em todos os planos";

export const INCLUDED_SECTION_DESCRIPTION =
  "A distinção entre os planos refere-se exclusivamente ao número de profissionais.";

export const BILLING_PLAN_DEFS: readonly BillingPlanDef[] = [
  {
    id: BillingPlan.SOLO,
    name: "Solo",
    tagline: "Atendimento individual",
    includedProfessionals: 1,
    extraSeatAllowed: false,
    highlights: ["Capacidade limitada a 1 profissional"],
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.SOLO],
  },
  {
    id: BillingPlan.PRO,
    name: "Professional",
    tagline: "Equipes de pequeno porte",
    includedProfessionals: 3,
    extraSeatAllowed: false,
    highlights: [
      "Indicada para equipes de até 3 profissionais",
      "Capacidade limitada aos profissionais incluídos",
    ],
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.PRO],
    recommended: true,
  },
  {
    id: BillingPlan.ENTERPRISE,
    name: "Enterprise",
    tagline: "Clínicas de maior porte",
    includedProfessionals: 9,
    extraSeatAllowed: true,
    highlights: [`Profissional adicional por R$ ${EXTRA_SEAT_PRICE_BRL}/mês`],
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.ENTERPRISE],
  },
];

export type BillingAccessMode = "full" | "read_only";

export type BillingAccess = {
  mode: BillingAccessMode;
  status: BillingStatus | null;
  plan: BillingPlan | null;
  trialEndsAt: Date | null;
  maxProfessionals: number | null;
  extraSeats: number;
  isLegacy: boolean;
};

export function planDef(plan: BillingPlan): BillingPlanDef {
  const def = BILLING_PLAN_DEFS.find((item) => item.id === plan);
  if (!def) throw new Error(`Plano desconhecido: ${plan}`);
  return def;
}

/** Rótulo curto de assentos para UI (pt-BR). */
export function planSeatLabel(plan: BillingPlanDef): string {
  const n = plan.includedProfessionals;
  if (n === 1) return "1 profissional";
  if (plan.extraSeatAllowed) {
    return `Até ${n} profissionais · adicional R$ ${EXTRA_SEAT_PRICE_BRL}/mês`;
  }
  return `Até ${n} profissionais`;
}

export function resolveBillingAccess(
  row: {
    status: BillingStatus;
    plan: BillingPlan | null;
    trialEndsAt: Date | null;
    extraSeats?: number;
  } | null,
): BillingAccess {
  if (!row) {
    return {
      mode: "full",
      status: null,
      plan: null,
      trialEndsAt: null,
      maxProfessionals: null,
      extraSeats: 0,
      isLegacy: true,
    };
  }

  const rawExtras = Math.max(0, row.extraSeats ?? 0);
  const extras = row.plan && planDef(row.plan).extraSeatAllowed ? rawExtras : 0;

  if (row.status === BillingStatus.TRIALING) {
    return {
      mode: "full",
      status: row.status,
      plan: row.plan,
      trialEndsAt: row.trialEndsAt,
      maxProfessionals: null,
      extraSeats: extras,
      isLegacy: false,
    };
  }

  const mode =
    row.status === BillingStatus.CANCELLED ||
    row.status === BillingStatus.UNPAID
      ? "read_only"
      : "full";

  const included = row.plan ? planDef(row.plan).includedProfessionals : null;

  return {
    mode,
    status: row.status,
    plan: row.plan,
    trialEndsAt: row.trialEndsAt,
    maxProfessionals: included == null ? null : included + extras,
    extraSeats: extras,
    isLegacy: false,
  };
}
