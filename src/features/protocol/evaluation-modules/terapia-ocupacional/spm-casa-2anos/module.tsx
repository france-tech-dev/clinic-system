import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  SPM_CASA_2ANOS_PROTOCOL_ID,
  SPM_CASA_2ANOS_TEMPLATE,
} from "./template";

export const spmCasa2anosModule = createItemEvaluationModule({
  id: SPM_CASA_2ANOS_PROTOCOL_ID,
  name: "SPM Casa (2 anos)",
  description: "Sensory Processing Measure — casa, 2 anos (75 itens).",
  template: SPM_CASA_2ANOS_TEMPLATE,
});
