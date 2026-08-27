import "dotenv/config";
import { getRedisUrl, JOB_QUEUE_NAME, JOB_NAMES } from "@/shared/lib/jobs";

async function main() {
  const { Worker } = await import("bullmq");

  const worker = new Worker(
    JOB_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case JOB_NAMES.MEDIA_PROCESS:
          console.log("[worker] media.process", job.data);
          // TODO: processManagedImageJob(job.data)
          break;
        case JOB_NAMES.WHATSAPP_REMINDER:
          console.log("[worker] whatsapp.reminder", job.data);
          // TODO: processWhatsappReminderJob(job.data)
          break;
        default:
          console.warn(`[worker] unknown job name: ${job.name}`);
      }
    },
    { connection: { url: getRedisUrl() || undefined } },
  );

  worker.on("failed", (job, err) => {
    console.error(`[worker] job ${job?.id} failed:`, err);
  });

  console.log(`[worker] listening on queue "${JOB_QUEUE_NAME}"`);
}

main().catch((err) => {
  console.error("[worker] fatal:", err);
  process.exit(1);
});
