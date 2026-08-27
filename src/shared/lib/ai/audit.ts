import "server-only";

import { db } from "@/shared/lib/prisma";

export type AiGenerationKind = "protocol-interpretation";

export async function logAiGeneration(input: {
  organizationId: string;
  userId: string;
  kind: AiGenerationKind;
  evaluationId: string | null;
}): Promise<void> {
  await db.aiGenerationLog.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      kind: input.kind,
      evaluationId: input.evaluationId,
    },
  });
}
