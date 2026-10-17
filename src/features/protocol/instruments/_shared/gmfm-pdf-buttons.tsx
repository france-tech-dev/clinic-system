import { FileDown } from "lucide-react";
import { toast } from "sonner";
import {
  buildGmfmResponsesPdfPayload,
  buildGmfmScoresPdfPayload,
} from "@/domains/protocol/_lib/pdf/build-gmfm-payload";
import { downloadGmfmPdf } from "@/features/protocol/_lib/pdf/download-gmfm-pdf";
import type { ProtocolAssessmentDTO } from "@/domains/protocol/protocol.types";
import { Button } from "@/components/ui/button";

const PROTOCOL_NAME = "GMFM-88";

export function GmfmPdfButtons({
  assessment,
  disabled,
}: {
  assessment: ProtocolAssessmentDTO;
  disabled?: boolean;
}) {
  async function downloadResponses() {
    try {
      await downloadGmfmPdf(
        buildGmfmResponsesPdfPayload({
          assessment,
          protocolName: PROTOCOL_NAME,
        }),
      );
    } catch {
      toast.error("Não foi possível gerar o PDF de respostas");
    }
  }

  async function downloadScores() {
    const payload = buildGmfmScoresPdfPayload({
      assessment,
      protocolName: PROTOCOL_NAME,
    });
    if (!payload) {
      toast.error("Scores ainda não disponíveis para esta avaliação");
      return;
    }
    try {
      await downloadGmfmPdf(payload);
    } catch {
      toast.error("Não foi possível gerar o PDF de scores");
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={() => void downloadResponses()}
        title="PDF respostas"
      >
        <FileDown data-icon="inline-start" />
        Respostas
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={() => void downloadScores()}
        title="PDF scores"
      >
        <FileDown data-icon="inline-start" />
        Scores
      </Button>
    </div>
  );
}
