import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  SPM_ESCOLA_5ANOS_PROTOCOL_ID,
  SPM_ESCOLA_5ANOS_TEMPLATE,
} from "@/domains/protocol/evaluation-modules/terapia-ocupacional/spm-escola-5anos/template";

export const spmEscola5anosModule = createItemEvaluationModule({
  id: SPM_ESCOLA_5ANOS_PROTOCOL_ID,
  name: "SPM Escola (5 anos)",
  description: "Sensory Processing Measure — escola, 5 anos (62 itens).",
  template: SPM_ESCOLA_5ANOS_TEMPLATE,
});
