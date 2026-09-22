import type { HealthProfessionId } from "@/shared/constants/professions";

export type CatalogInstrumentDef = {
  id: string;
  name: string;
  description: string;
};

export type CatalogInstrument = CatalogInstrumentDef & {
  href: string;
};

export type ProfessionInstrumentCatalogItem = {
  professionId: HealthProfessionId;
  label: string;
  council: string;
  assessments: CatalogInstrument[];
};
