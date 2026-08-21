import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  SPM_CASA_3ANOS_PROTOCOL_ID,
  SPM_CASA_3ANOS_TEMPLATE,
} from "./template";

export const spmCasa3anosModule = createItemEvaluationModule({
  id: SPM_CASA_3ANOS_PROTOCOL_ID,
  name: "SPM Casa (3 anos)",
  description: "Sensory Processing Measure — casa, 3 anos (75 itens).",
  template: SPM_CASA_3ANOS_TEMPLATE,
});
