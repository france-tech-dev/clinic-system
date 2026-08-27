export type JobName = "media.process" | "whatsapp.reminder";

export type JobPayloads = {
  "media.process": {
    organizationId: string;
    kind: "avatar" | "logo";
    /** Storage key or temp ref */
    ref: string;
    userId?: string;
  };
  "whatsapp.reminder": {
    organizationId: string;
    appointmentId: string;
  };
};

export type JobPayload<N extends JobName> = JobPayloads[N];
