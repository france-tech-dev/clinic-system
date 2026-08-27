import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  SPM_ESCOLA_3ANOS_PROTOCOL_ID,
  SPM_ESCOLA_3ANOS_TEMPLATE,
} from "@/domains/protocol/evaluation-modules/terapia-ocupacional/spm-escola-3anos/template";

export const spmEscola3anosModule = createItemEvaluationModule({
  id: SPM_ESCOLA_3ANOS_PROTOCOL_ID,
  name: "SPM Escola (3 anos)",
  description: "Sensory Processing Measure — escola, 3 anos (75 itens).",
  template: SPM_ESCOLA_3ANOS_TEMPLATE,
});
