export const HEALTH_PROFESSIONS = [
  { id: "medico", label: "Médico", council: "CRM" },
  { id: "psicologo", label: "Psicólogo", council: "CRP" },
  { id: "fisioterapeuta", label: "Fisioterapeuta", council: "CREFITO" },
  {
    id: "terapeuta_ocupacional",
    label: "Terapeuta Ocupacional",
    council: "CREFITO",
  },
  { id: "fonoaudiologo", label: "Fonoaudiólogo", council: "CRFa" },
  { id: "nutricionista", label: "Nutricionista", council: "CRN" },
  { id: "enfermeiro", label: "Enfermeiro", council: "COREN" },
  { id: "dentista", label: "Cirurgião-Dentista", council: "CRO" },
  { id: "educador_fisico", label: "Educador Físico", council: "CREF" },
] as const;

export type HealthProfessionId = (typeof HEALTH_PROFESSIONS)[number]["id"];

export const HEALTH_PROFESSION_IDS = HEALTH_PROFESSIONS.map((p) => p.id) as [
  HealthProfessionId,
  ...HealthProfessionId[],
];

export function getHealthProfession(id: string | null | undefined) {
  if (!id) return undefined;
  return HEALTH_PROFESSIONS.find((p) => p.id === id);
}
