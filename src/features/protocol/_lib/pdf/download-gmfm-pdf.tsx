import { downloadPdfBlob, renderPdfBlob } from "@/shared/lib/pdf/generate";
import type { GmfmPdfPayload } from "@/domains/protocol/_lib/pdf/types";
import { GmfmComparisonDocument } from "./gmfm-comparison-document";
import { GmfmResponsesDocument } from "./gmfm-responses-document";
import { GmfmScoresDocument } from "./gmfm-scores-document";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function downloadGmfmPdf(payload: GmfmPdfPayload): Promise<void> {
  const doc =
    payload.kind === "responses" ? (
      <GmfmResponsesDocument payload={payload} />
    ) : payload.kind === "scores" ? (
      <GmfmScoresDocument payload={payload} />
    ) : (
      <GmfmComparisonDocument payload={payload} />
    );

  const blob = await renderPdfBlob(doc);
  const suffix =
    payload.kind === "responses"
      ? "respostas"
      : payload.kind === "scores"
        ? "scores"
        : "comparativo";
  await downloadPdfBlob(
    blob,
    `gmfm-88-${suffix}-${slugify(payload.patientName)}.pdf`,
  );
}
