import { SessionNoteStatus } from "@prisma/enums";

export const SESSION_NOTE_STATUS_LABEL = {
  [SessionNoteStatus.ATTENDED]: "Compareceu",
  [SessionNoteStatus.ABSENT]: "Faltou",
  [SessionNoteStatus.CANCELLED]: "Cancelado",
} as const satisfies Record<SessionNoteStatus, string>;

export function sessionNoteStatusLabel(status: SessionNoteStatus): string {
  return SESSION_NOTE_STATUS_LABEL[status];
}

export const SESSION_STATUSES = [
  SessionNoteStatus.ATTENDED,
  SessionNoteStatus.ABSENT,
  SessionNoteStatus.CANCELLED,
] as const;
