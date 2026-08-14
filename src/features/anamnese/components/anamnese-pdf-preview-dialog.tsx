"use client";

import dynamic from "next/dynamic";
import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AnamneseDocument } from "@/features/anamnese/_lib/pdf/documents/anamnese-document";
import type { AnamneseReportPayload } from "@/features/anamnese/_lib/pdf/types";
import { downloadPdfBlob, renderPdfBlob } from "@/shared/lib/pdf/generate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

const PdfViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[70dvh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    ),
  },
);

function slugifyName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function AnamnesePdfPreviewDialog({
  payload,
  onClose,
}: {
  payload: AnamneseReportPayload | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const logoOrigin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  function handleDownload() {
    if (!payload) return;
    startTransition(async () => {
      try {
        const blob = await renderPdfBlob(
          <AnamneseDocument payload={payload} logoOrigin={logoOrigin} />,
        );
        await downloadPdfBlob(
          blob,
          `anamnese-${slugifyName(payload.patientName)}.pdf`,
        );
        toast.success("PDF baixado");
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível baixar o PDF");
      }
    });
  }

  return (
    <Dialog open={payload !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[92dvh] max-h-[92dvh] max-w-7xl flex-col gap-0 overflow-hidden p-0 sm:max-w-7xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="font-serif">
            Pré-visualização do relatório
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden bg-muted/30">
          {payload ? (
            <PdfViewer
              width="100%"
              height="100%"
              style={{ border: "none", minHeight: "100%" }}
              showToolbar
            >
              <AnamneseDocument payload={payload} logoOrigin={logoOrigin} />
            </PdfViewer>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-4 py-3">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button disabled={pending || !payload} onClick={handleDownload}>
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Download data-icon="inline-start" />
            )}
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
