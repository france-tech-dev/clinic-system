import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export async function renderPdfBlob(
  document: ReactElement<DocumentProps>,
): Promise<Blob> {
  return pdf(document).toBlob();
}

export async function downloadPdfBlob(
  blob: Blob,
  filename: string,
): Promise<void> {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
