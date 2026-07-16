import template from "./template.json";

export const GMFM88_PROTOCOL_ID = "gmfm-88" as const;
export const GMFM88_MAX_ITEM_SCORE = 3;

export type Gmfm88Item = {
  id: string;
  label: string;
};

export type Gmfm88Domain = {
  id: string;
  title: string;
  items: Gmfm88Item[];
};

export type Gmfm88Template = {
  domains: Gmfm88Domain[];
};

export const GMFM88_TEMPLATE = template as Gmfm88Template;

export const GMFM88_ITEM_IDS = GMFM88_TEMPLATE.domains.flatMap((d) =>
  d.items.map((i) => i.id),
);

export function gmfm88DomainById(id: string): Gmfm88Domain | undefined {
  return GMFM88_TEMPLATE.domains.find((d) => d.id === id);
}

export function gmfm88ItemById(itemId: string): Gmfm88Item | undefined {
  for (const domain of GMFM88_TEMPLATE.domains) {
    const item = domain.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}
