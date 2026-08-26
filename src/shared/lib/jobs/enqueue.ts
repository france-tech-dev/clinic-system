import type { JobName, JobPayload } from "./types";
import { JOB_QUEUE_NAME } from "./queues";
import { getRedisUrl } from "./redis";

/**
 * Enqueue a domain job. No-ops with console.warn if REDIS_URL is missing (dev without Redis).
 */
export async function enqueue<N extends JobName>(
  name: N,
  payload: JobPayload<N>,
  opts?: { delayMs?: number },
): Promise<{ id: string } | null> {
  const url = getRedisUrl();
  if (!url) {
    console.warn(`[jobs] REDIS_URL missing — skip enqueue ${name}`);
    return null;
  }
  // Dynamic import so apps without bullmq installed still typecheck if needed
  const { Queue } = await import("bullmq");
  const queue = new Queue(JOB_QUEUE_NAME, { connection: { url } });
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
