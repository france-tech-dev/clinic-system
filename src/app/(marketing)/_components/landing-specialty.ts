export type LandingSpecialty = {
  label: string;
  forText: string;
  anam: string;
  description: string;
  color: string;
  tint: string;
};

export const LANDING_SPECIALTIES: readonly LandingSpecialty[] = [
  {
    label: "Fisioterapia",
    forText: "fisioterapia",
    anam: "Anamnese de fisioterapia",
    description:
      "Agenda do turno, evoluções com registro profissional e avaliações como GMFM-88 — com financeiro e equipe no mesmo sistema.",
    color: "#F3A48C",
    tint: "#FADBD1",
  },
  {
    label: "Terapia ocupacional",
    forText: "terapia ocupacional",
    anam: "Anamnese de terapia ocupacional",
    description:
      "Anamnese de TO, evolução e avaliações estruturadas como PEDI, Perfil Sensorial e SPM, com agenda, financeiro e equipe no mesmo sistema.",
    color: "#F5B24E",
    tint: "#FBE6BF",
  },
  {
    label: "Fonoaudiologia",
    forText: "fonoaudiologia",
    anam: "Anamnese de fonoaudiologia",
    description:
      "Organize o dia de atendimentos, registre evoluções assinadas e acompanhe o histórico do paciente — com caixa e equipe no mesmo lugar.",
    color: "#7DB6CF",
    tint: "#D6E8F1",
  },
  {
    label: "Psicologia",
    forText: "psicologia",
    anam: "Anamnese de psicologia",
    description:
      "Prontuário e evoluções no fluxo do atendimento, com agenda da equipe e visão financeira da clínica sem planilha paralela.",
    color: "#B9A7D8",
    tint: "#E4DDF1",
  },
  {
    label: "Nutrição",
    forText: "nutrição",
    anam: "Anamnese de nutrição",
    description:
      "Registre sessões e evoluções com assinatura profissional, filtre a agenda por paciente e acompanhe cobranças no caixa.",
    color: "#9CB49A",
    tint: "#DCE6DA",
  },
  {
    label: "Outra área",
    forText: "a sua especialidade",
    anam: "Anamnese da sua área",
    description:
      "Clínicas multiprofissionais usam o Movi com agenda, prontuário, evoluções, caixa e equipe — tudo isolado por organização.",
    color: "#39523F",
    tint: "#C9D6CB",
  },
] as const;

/** Índice padrão: Terapia ocupacional */
export const LANDING_DEFAULT_SPECIALTY_INDEX = 1;
