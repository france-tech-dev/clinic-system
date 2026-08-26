export { gmfm88Module } from "./module";
export {
  GMFM88_PROTOCOL_ID,
  GMFM88_MAX_ITEM_SCORE,
  GMFM88_TEMPLATE,
  GMFM88_ITEM_IDS,
  gmfm88DomainById,
  gmfm88ItemById,
  type Gmfm88Item,
  type Gmfm88Domain,
  type Gmfm88Template,
} from "@/domains/protocol/evaluation-modules/fisioterapia/gmfm-88/template";
export {
  emptyGmfm88Scores,
  summarizeGmfm88,
  summarizeGmfm88Domain,
  type Gmfm88Scores,
  type Gmfm88DomainSummary,
  type Gmfm88OverallSummary,
} from "@/domains/protocol/evaluation-modules/fisioterapia/gmfm-88/scoring";
