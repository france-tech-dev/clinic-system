import { getRedisUrl, JOB_NAMES, JOB_QUEUE_NAME } from "@/shared/lib/jobs";
import "dotenv/config";

async function main() {
  const { Worker } = await import("bullmq");

  const worker = new Worker(
    JOB_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case JOB_NAMES.MEDIA_PROCESS:
          console.log("[consumer] media.process", job.data);
          // TODO: processManagedImageJob(job.data)
          break;
        case JOB_NAMES.WHATSAPP_REMINDER:
          console.log("[consumer] whatsapp.reminder", job.data);
          // TODO: processWhatsappReminderJob(job.data)
          break;
        default:
          console.warn(`[consumer] unknown job name: ${job.name}`);
      }
    },
    { connection: { url: getRedisUrl() } },
  );

  worker.on("failed", (job, err) => {
    console.error(`[consumer] job ${job?.id} failed:`, err);
  });

  console.log(`[consumer] listening on queue "${JOB_QUEUE_NAME}"`);
}

main().catch((err) => {
  console.error("[consumer] fatal:", err);
  process.exit(1);
});
