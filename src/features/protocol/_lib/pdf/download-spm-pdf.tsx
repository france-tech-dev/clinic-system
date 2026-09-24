import { downloadPdfBlob, renderPdfBlob } from "@/shared/lib/pdf/generate";
import type { SpmPdfPayload } from "@/domains/protocol/_lib/pdf/types";
import { SpmResponsesDocument } from "./spm-responses-document";
import { SpmScoresDocument } from "./spm-scores-document";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function downloadSpmPdf(payload: SpmPdfPayload): Promise<void> {
  const doc =
    payload.kind === "responses" ? (
      <SpmResponsesDocument payload={payload} />
    ) : (
      <SpmScoresDocument payload={payload} />
    );

  const blob = await renderPdfBlob(doc);
  const suffix = payload.kind === "responses" ? "respostas" : "scores";
  await downloadPdfBlob(
    blob,
    `spm-${suffix}-${slugify(payload.patientName)}.pdf`,
  );
}
