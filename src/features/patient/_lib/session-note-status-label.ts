import type { SessionNoteStatus } from "../patient.types";

export const SESSION_NOTE_STATUS_LABEL: Record<SessionNoteStatus, string> = {
  attended: "Compareceu",
  absent: "Faltou",
  cancelled: "Cancelado",
};
