import type { JobName } from "./types";

export const JOB_QUEUE_NAME = "clinic-jobs";

export const JOB_NAMES = {
  MEDIA_PROCESS: "media.process",
  WHATSAPP_REMINDER: "whatsapp.reminder",
} as const satisfies Record<string, JobName>;
