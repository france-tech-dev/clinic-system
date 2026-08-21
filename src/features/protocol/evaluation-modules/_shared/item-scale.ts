export const PEDI_SCALE_VALUES = [0, 1] as const;
export type PediScaleValue = (typeof PEDI_SCALE_VALUES)[number];

export const SPM_SCALE_VALUES = ["N", "O", "F", "S"] as const;
export type SpmScaleValue = (typeof SPM_SCALE_VALUES)[number];

export type ItemScaleId = "pedi" | "spm";

export type ItemResponseValue = PediScaleValue | SpmScaleValue;

export const ITEM_SCALE_OPTIONS: Record<
  ItemScaleId,
  ReadonlyArray<{ value: ItemResponseValue; label: string }>
> = {
  pedi: [
    { value: 0, label: "Não realiza" },
    { value: 1, label: "Realiza" },
  ],
  spm: [
    { value: "N", label: "Nunca" },
    { value: "O", label: "Ocasionalmente" },
    { value: "F", label: "Frequentemente" },
    { value: "S", label: "Sempre" },
  ],
};

export function isValidItemResponse(
  scale: ItemScaleId,
  value: unknown,
): value is ItemResponseValue {
  if (scale === "pedi") {
    return value === 0 || value === 1;
  }
  return value === "N" || value === "O" || value === "F" || value === "S";
}
