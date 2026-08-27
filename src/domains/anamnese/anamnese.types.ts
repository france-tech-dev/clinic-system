export type AnamneseDTO = {
  id: string;
  organizationId: string;
  patientId: string;
  formId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AnamneseSummaryDTO = {
  id: string;
  formId: string;
  label: string;
  updatedAt: string;
};
