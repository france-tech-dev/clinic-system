import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  SPM_ESCOLA_2ANOS_PROTOCOL_ID,
  SPM_ESCOLA_2ANOS_TEMPLATE,
} from "@/domains/protocol/evaluation-modules/terapia-ocupacional/spm-escola-2anos/template";

export const spmEscola2anosModule = createItemEvaluationModule({
  id: SPM_ESCOLA_2ANOS_PROTOCOL_ID,
  name: "SPM Escola (2 anos)",
  description: "Sensory Processing Measure — escola, 2 anos (75 itens).",
  professionId: "terapeuta_ocupacional",
  template: SPM_ESCOLA_2ANOS_TEMPLATE,
});
