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
  includedProfessionals: number;
  extraSeatAllowed: boolean;
  highlights: readonly string[];
  priceMonthlyBrl: number;
};

/** Highlights partilhados — todos os planos incluem o produto completo. */
export const SHARED_PLAN_HIGHLIGHTS = [
  "Agenda, pacientes, prontuário, evoluções e PDF",
  "Anamnese, avaliações, caixa e portal do responsável",
  "Interpretação assistida por IA (protocolos)",
  "Dashboard, busca e configurações da clínica",
] as const;

export const BILLING_PLAN_DEFS: readonly BillingPlanDef[] = [
  {
    id: BillingPlan.SOLO,
    name: "Solo",
    includedProfessionals: 1,
    extraSeatAllowed: false,
    highlights: [
      ...SHARED_PLAN_HIGHLIGHTS,
      "1 profissional (sem adicionais — atualize para o Professional)",
    ],
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.SOLO],
  },
  {
    id: BillingPlan.PRO,
    name: "Professional",
    includedProfessionals: 3,
    extraSeatAllowed: false,
    highlights: [
      ...SHARED_PLAN_HIGHLIGHTS,
      "Até 3 profissionais (sem adicionais — atualize para o Enterprise)",
    ],
    priceMonthlyBrl: BILLING_PLAN_PRICES_BRL[BillingPlan.PRO],
  },
  {
    id: BillingPlan.ENTERPRISE,
    name: "Enterprise",
    includedProfessionals: 9,
    extraSeatAllowed: true,
    highlights: [
      ...SHARED_PLAN_HIGHLIGHTS,
      "Até 9 profissionais incluídos",
      `Profissional adicional por R$ ${EXTRA_SEAT_PRICE_BRL}/mês`,
    ],
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
