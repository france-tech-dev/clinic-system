import type { SearchHit } from "@/features/dashboard/search.service";

export const SEARCH_KIND_LABEL: Record<SearchHit["kind"], string> = {
  patient: "Paciente",
  exercise: "Atividade",
  evaluation: "Avaliação",
  session: "Evolução",
  study: "Estudo",
};
