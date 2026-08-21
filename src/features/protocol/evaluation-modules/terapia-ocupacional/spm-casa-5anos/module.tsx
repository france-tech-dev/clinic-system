import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  SPM_CASA_5ANOS_PROTOCOL_ID,
  SPM_CASA_5ANOS_TEMPLATE,
} from "./template";

export const spmCasa5anosModule = createItemEvaluationModule({
  id: SPM_CASA_5ANOS_PROTOCOL_ID,
  name: "SPM Casa (5 anos)",
  description: "Sensory Processing Measure — casa, 5 anos (75 itens).",
  template: SPM_CASA_5ANOS_TEMPLATE,
});
