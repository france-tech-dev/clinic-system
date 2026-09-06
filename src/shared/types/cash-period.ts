export const PERIOD_PRESET_IDS = [
  "today",
  "week",
  "month",
  "7d",
  "30d",
  "custom",
] as const;

export type PeriodPreset = (typeof PERIOD_PRESET_IDS)[number];

export type CashPeriod = {
  preset: PeriodPreset;
  start: string;
  end: string;
  label: string;
};
