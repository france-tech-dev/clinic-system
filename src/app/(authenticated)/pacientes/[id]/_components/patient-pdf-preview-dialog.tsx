"use client";

import dynamic from "next/dynamic";
import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadPatientReport } from "@/features/patient/_lib/pdf/download-patient-report";
import type { PatientReportPayload } from "@/features/patient/_lib/pdf/types";
import { PatientReportDocument } from "@/features/patient/_lib/pdf/build-patient-report-document";
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
      <div className="flex h-full min-h-[420px] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    ),
  },
);

export function PatientPdfPreviewDialog({
  payload,
  onClose,
}: {
  payload: PatientReportPayload | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const logoOrigin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  function handleDownload() {
    if (!payload) return;
    startTransition(async () => {
      try {
        await downloadPatientReport(payload, logoOrigin);
        toast.success("PDF baixado");
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível baixar o PDF");
      }
    });
  }

  return (
    <Dialog open={payload !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="font-serif">
            Pré-visualização do relatório
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[420px] flex-1 overflow-hidden bg-muted/30">
          {payload ? (
            <PdfViewer
              width="100%"
              height="100%"
              style={{ border: "none", minHeight: "60vh" }}
              showToolbar
            >
              <PatientReportDocument
                payload={payload}
                logoOrigin={logoOrigin}
              />
            </PdfViewer>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border px-6 pb-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button disabled={!payload || pending} onClick={handleDownload}>
            <Download className="size-4" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
