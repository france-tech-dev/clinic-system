export type ProfessionalProfile = {
  name: string;
  registration: string;
  clinic: string;
};

export type PrintBranding = {
  clinicName: string;
  logoUrl: string;
};

export const EMPTY_PROFESSIONAL: ProfessionalProfile = {
  name: "",
  registration: "",
  clinic: "",
};

/** Perfil de assinatura guardado em Member.metadata (JSON). */
export type MemberProfessionalStored = {
  name: string;
  registration: string;
};

export function formatProfessionalSignature(p: ProfessionalProfile): string {
  if (!p.name.trim()) {
    return "Assinatura e carimbo do profissional";
  }
  const parts = [p.name.trim()];
  if (p.registration.trim()) parts.push(p.registration.trim());
  if (p.clinic.trim()) parts.push(p.clinic.trim());
  return parts.join(" · ");
}

export function parseMemberProfessionalMetadata(
  raw: string | null | undefined,
): MemberProfessionalStored {
  if (!raw?.trim()) return { name: "", registration: "" };
  try {
    const parsed = JSON.parse(raw) as {
      professional?: Partial<MemberProfessionalStored>;
      name?: string;
      registration?: string;
    };
    const source = parsed.professional ?? parsed;
    return {
      name: typeof source.name === "string" ? source.name : "",
      registration:
        typeof source.registration === "string" ? source.registration : "",
    };
  } catch {
    return { name: "", registration: "" };
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
      name: profile.name.trim(),
      registration: profile.registration.trim(),
    },
  });
}

/** Constrói perfil usável no PDF a partir do Member (+ name do User como fallback). */
export function memberToProfessionalProfile(
  metadata: string | null | undefined,
  userName: string | null | undefined,
  registrationColumn?: string | null,
): ProfessionalProfile | null {
  const stored = parseMemberProfessionalMetadata(metadata);
  const name = stored.name.trim() || userName?.trim() || "";
  const registration =
    registrationColumn?.trim() || stored.registration.trim();
  if (!name && !registration) return null;
  return {
    name: name || "Profissional",
    registration,
    clinic: "",
  };
}

export function resolveReportProfessional(
  author: ProfessionalProfile | null | undefined,
  orgFallback: ProfessionalProfile,
): ProfessionalProfile {
  if (!author) return orgFallback;
  if (!author.name.trim() && !author.registration.trim()) return orgFallback;
  return {
    name: author.name.trim() || orgFallback.name,
    registration: author.registration.trim() || orgFallback.registration,
    clinic: author.clinic || orgFallback.clinic,
  };
}
