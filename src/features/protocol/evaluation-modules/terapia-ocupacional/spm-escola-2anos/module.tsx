import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  SPM_ESCOLA_2ANOS_PROTOCOL_ID,
  SPM_ESCOLA_2ANOS_TEMPLATE,
} from "./template";

export const spmEscola2anosModule = createItemEvaluationModule({
  id: SPM_ESCOLA_2ANOS_PROTOCOL_ID,
  name: "SPM Escola (2 anos)",
  description: "Sensory Processing Measure — escola, 2 anos (75 itens).",
  template: SPM_ESCOLA_2ANOS_TEMPLATE,
});
