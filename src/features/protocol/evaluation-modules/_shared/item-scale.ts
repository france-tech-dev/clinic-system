export const PEDI_SCALE_VALUES = [0, 1] as const;
export type PediScaleValue = (typeof PEDI_SCALE_VALUES)[number];

export const SPM_SCALE_VALUES = ["N", "O", "F", "S"] as const;
export type SpmScaleValue = (typeof SPM_SCALE_VALUES)[number];

/** Perfil Sensorial (criança pequena): 5→0. */
export const PERFIL_SENSORIAL_SCALE_VALUES = [5, 4, 3, 2, 1, 0] as const;
export type PerfilSensorialScaleValue =
  (typeof PERFIL_SENSORIAL_SCALE_VALUES)[number];

export type ItemScaleId = "pedi" | "spm" | "perfil-sensorial";

export type ItemResponseValue =
  PediScaleValue | SpmScaleValue | PerfilSensorialScaleValue;

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
  "perfil-sensorial": [
    { value: 5, label: "Quase sempre" },
    { value: 4, label: "Frequentemente" },
    { value: 3, label: "Metade do tempo" },
    { value: 2, label: "Ocasionalmente" },
    { value: 1, label: "Quase Nunca" },
    { value: 0, label: "Não se aplica" },
  ],
};

export function isValidItemResponse(
  scale: ItemScaleId,
  value: unknown,
): value is ItemResponseValue {
  if (scale === "pedi") {
    return value === 0 || value === 1;
  }
  if (scale === "perfil-sensorial") {
    return (
      value === 0 ||
      value === 1 ||
      value === 2 ||
      value === 3 ||
      value === 4 ||
      value === 5
    );
  }
  return value === "N" || value === "O" || value === "F" || value === "S";
}
