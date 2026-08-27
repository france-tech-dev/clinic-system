export type AnamneseFieldType =
  | "text"
  | "textarea"
  | "check"
  | "radio"
  | "select"
  | "rating-grid"
  | "status-table";

export type AnamneseField = {
  id: string;
  label: string;
  type: AnamneseFieldType;
  w?: string;
  placeholder?: string;
  options?: string[];
  items?: string[];
  rows?: number | string[];
  hint?: string;
};

export type AnamneseSection = {
  id: string;
  title: string;
  hint?: string;
  fields: AnamneseField[];
};
