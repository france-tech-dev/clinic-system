import { FileDown } from "lucide-react";
import { toast } from "sonner";
import {
  buildSpmResponsesPdfPayload,
  buildSpmScoresPdfPayload,
} from "@/domains/protocol/_lib/pdf/build-spm-payload";
import { downloadSpmPdf } from "@/features/protocol/_lib/pdf/download-spm-pdf";
import type { ProtocolAssessmentDTO } from "@/domains/protocol/protocol.types";
import type { ItemProtocolTemplate } from "@/domains/protocol/instruments/_shared/item-protocol-template";
import { Button } from "@/components/ui/button";

export function SpmPdfButtons({
  assessment,
  protocolName,
  template,
  disabled,
}: {
  assessment: ProtocolAssessmentDTO;
  protocolName: string;
  template: ItemProtocolTemplate;
  disabled?: boolean;
}) {
  async function downloadResponses() {
    try {
      await downloadSpmPdf(
        buildSpmResponsesPdfPayload({
          assessment,
          protocolName,
          template,
        }),
      );
    } catch {
      toast.error("Não foi possível gerar o PDF de respostas");
    }
  }

  async function downloadScores() {
    const payload = buildSpmScoresPdfPayload({ assessment, protocolName });
    if (!payload) {
      toast.error("Scores ainda não disponíveis para esta avaliação");
      return;
    }
    try {
      await downloadSpmPdf(payload);
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
