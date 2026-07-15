export type ProfessionalProfile = {
  nome: string;
  registro: string;
  clinica: string;
};

export type PrintBranding = {
  clinicName: string;
  logoUrl: string;
};

export const EMPTY_PROFESSIONAL: ProfessionalProfile = {
  nome: "",
  registro: "",
  clinica: "",
};

/** Perfil de assinatura guardado em Member.metadata (JSON). */
export type MemberProfessionalStored = {
  nome: string;
  registro: string;
};

export function formatProfessionalSignature(p: ProfessionalProfile): string {
  if (!p.nome.trim()) {
    return "Assinatura e carimbo — Terapeuta Ocupacional";
  }
  const reg = p.registro.trim() ? ` · ${p.registro.trim()}` : "";
  return `${p.nome.trim()}${reg} — Terapeuta Ocupacional`;
}

export function parseMemberProfessionalMetadata(
  raw: string | null | undefined,
): MemberProfessionalStored {
  if (!raw?.trim()) return { nome: "", registro: "" };
  try {
    const parsed = JSON.parse(raw) as {
      professional?: Partial<MemberProfessionalStored>;
      nome?: string;
      registro?: string;
    };
    const source = parsed.professional ?? parsed;
    return {
      nome: typeof source.nome === "string" ? source.nome : "",
      registro: typeof source.registro === "string" ? source.registro : "",
    };
  } catch {
    return { nome: "", registro: "" };
  }
}

export function serializeMemberProfessionalMetadata(
  profile: MemberProfessionalStored,
  existingRaw?: string | null,
): string {
  let base: Record<string, unknown> = {};
  if (existingRaw?.trim()) {
    try {
      base = JSON.parse(existingRaw) as Record<string, unknown>;
    } catch {
      base = {};
    }
  }
  return JSON.stringify({
    ...base,
    professional: {
      nome: profile.nome.trim(),
      registro: profile.registro.trim(),
    },
  });
}

/** Constrói perfil usável no PDF a partir do Member (+ nome do User como fallback). */
export function memberToProfessionalProfile(
  metadata: string | null | undefined,
  userName: string | null | undefined,
  registroColumn?: string | null,
): ProfessionalProfile | null {
  const stored = parseMemberProfessionalMetadata(metadata);
  const nome = stored.nome.trim() || userName?.trim() || "";
  const registro = registroColumn?.trim() || stored.registro.trim();
  if (!nome && !registro) return null;
  return {
    nome: nome || "Profissional",
    registro,
    clinica: "",
  };
}

export function resolveReportProfessional(
  author: ProfessionalProfile | null | undefined,
  orgFallback: ProfessionalProfile,
): ProfessionalProfile {
  if (!author) return orgFallback;
  if (!author.nome.trim() && !author.registro.trim()) return orgFallback;
  return {
    nome: author.nome.trim() || orgFallback.nome,
    registro: author.registro.trim() || orgFallback.registro,
    clinica: author.clinica || orgFallback.clinica,
  };
}
