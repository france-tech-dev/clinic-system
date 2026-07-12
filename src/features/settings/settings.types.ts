export type ProfessionalProfile = {
  nome: string;
  registro: string;
  clinica: string;
};

export type ClinicSettings = {
  professional: ProfessionalProfile;
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

export function formatProfessionalSignature(p: ProfessionalProfile): string {
  if (!p.nome.trim()) {
    return "Assinatura e carimbo — Terapeuta Ocupacional";
  }
  const reg = p.registro.trim() ? ` · ${p.registro.trim()}` : "";
  return `${p.nome.trim()}${reg} — Terapeuta Ocupacional`;
}
