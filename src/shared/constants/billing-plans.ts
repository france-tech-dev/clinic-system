export const BILLING_PLANS = ["starter", "pro", "enterprise"] as const;
export type BillingPlanId = (typeof BILLING_PLANS)[number];

export const BILLING_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
] as const;
export type BillingStatusId = (typeof BILLING_STATUSES)[number];

/** Só o que o plano corta — módulos base da clínica não entram aqui. */
export const GATED_FEATURES = [
  "anamnese",
  "caixa",
  "avaliacoes",
  "portal",
] as const;
export type GatedFeatureId = (typeof GATED_FEATURES)[number];

export const TRIAL_DAYS = 7;

export type BillingPlanDef = {
  id: BillingPlanId;
  name: string;
  maxProfessionals: number | null;
  features: readonly GatedFeatureId[];
  highlights: readonly string[];
};

export const BILLING_PLAN_DEFS: readonly BillingPlanDef[] = [
  {
    id: "starter",
    name: "Starter",
    maxProfessionals: 3,
    features: [],
    highlights: [
      "Até 3 profissionais",
      "Agenda, pacientes e equipa",
      "Painel, busca e configurações",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    maxProfessionals: 9,
    features: ["anamnese", "caixa"],
    highlights: ["Até 9 profissionais", "Tudo do Starter", "Anamnese e caixa"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    maxProfessionals: null,
    features: ["anamnese", "caixa", "avaliacoes", "portal"],
    highlights: [
      "Profissionais ilimitados",
      "Tudo do Pro",
      "Avaliações e portal dos pais",
    ],
  },
];

export type BillingAccessMode = "full" | "read_only";

export type BillingAccess = {
  mode: BillingAccessMode;
  status: BillingStatusId | null;
  plan: BillingPlanId | null;
  trialEndsAt: Date | null;
  /** Features gated incluídas (trial/legado = todas). */
  features: readonly GatedFeatureId[];
  maxProfessionals: number | null;
  isLegacy: boolean;
};

function planDef(plan: BillingPlanId): BillingPlanDef {
  const def = BILLING_PLAN_DEFS.find((item) => item.id === plan);
  if (!def) throw new Error(`Plano desconhecido: ${plan}`);
  return def;
}

export function resolveBillingAccess(
  row: {
    status: BillingStatusId;
    plan: BillingPlanId | null;
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

  if (row.status === "trialing") {
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
    row.status === "canceled" || row.status === "unpaid" ? "read_only" : "full";

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
