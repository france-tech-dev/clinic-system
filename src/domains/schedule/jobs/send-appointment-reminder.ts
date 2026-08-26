import type { JobPayload } from "@/shared/lib/jobs";

/**
 * Process a WhatsApp appointment reminder job.
 * Stub — wire to messaging when Redis + worker are live.
 */
export async function processWhatsappReminderJob(
  _payload: JobPayload<"whatsapp.reminder">,
): Promise<void> {
  // TODO: send WhatsApp reminder for appointment
}
