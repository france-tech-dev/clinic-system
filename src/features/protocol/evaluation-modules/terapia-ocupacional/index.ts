import type { HealthProfessionId } from "@/shared/constants/professions";
import { terapiaOcupacionalCatalogEvaluations } from "./catalog";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

// Roteiros T.O.: metadados em `./catalog.ts`; render em
// `features/patient/roteiro-evaluation-module-ui.tsx`, compostos via
// `app/(authenticated)/avaliacoes/_lib/resolve-evaluation-module-ui.ts`.

export { terapiaOcupacionalCatalogEvaluations };
