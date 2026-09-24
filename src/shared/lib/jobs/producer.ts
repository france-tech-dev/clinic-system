import { getRedisUrl } from "@/shared/lib/redis";
import { JOB_QUEUE_NAME } from "./queues";
import type { JobName, JobPayload } from "./types";

export async function produce<N extends JobName>(
  name: N,
  payload: JobPayload<N>,
  opts?: { delayMs?: number },
): Promise<{ id: string }> {
  const { Queue } = await import("bullmq");
  const queue = new Queue(JOB_QUEUE_NAME, {
    connection: { url: getRedisUrl() },
  });
  try {
    const job = await queue.add(name, payload, {
      delay: opts?.delayMs,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });
    return { id: String(job.id) };
  } finally {
    await queue.close();
  }
}
