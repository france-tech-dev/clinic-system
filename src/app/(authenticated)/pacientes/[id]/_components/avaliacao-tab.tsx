"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CreateProtocolInviteDialog,
  type PublicInviteProtocolOption,
} from "@/features/protocol/components/create-protocol-invite-dialog";
import { ProtocolInviteStatusList } from "@/features/protocol/components/protocol-invite-status";
import type { ProtocolInviteDTO } from "@/features/protocol/invite/protocol-invite.types";
import type { ClinicalEvaluationDTO } from "@/features/patient/patient.types";
import { AvaliacaoLista } from "./avaliacao-lista";

export function AvaliacaoTab({
  patientId,
  clinicalEvaluations,
  initialInvites,
  inviteProtocols,
  canWriteInvites,
  onNewEvaluation,
  onViewEvaluation,
}: {
  patientId: string;
  clinicalEvaluations: ClinicalEvaluationDTO[];
  initialInvites: ProtocolInviteDTO[];
  inviteProtocols: PublicInviteProtocolOption[];
  canWriteInvites: boolean;
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: ClinicalEvaluationDTO) => void;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invites, setInvites] = useState(initialInvites);

  return (
    <section
      role="tabpanel"
      id="patient-tabpanel-avaliacao"
      aria-labelledby="patient-tab-avaliacao"
      className="space-y-6"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Links públicos</h2>
          {canWriteInvites && inviteProtocols.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setInviteOpen(true)}
            >
              <Link2 data-icon="inline-start" />
              Gerar link de avaliação
            </Button>
          ) : null}
        </div>
        <ProtocolInviteStatusList
          invites={invites}
          canManage={canWriteInvites}
          onChange={setInvites}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Prontuário clínico</h2>
        <AvaliacaoLista
          clinicalEvaluations={clinicalEvaluations}
          onNewEvaluation={onNewEvaluation}
          onViewEvaluation={onViewEvaluation}
        />
      </div>

      <CreateProtocolInviteDialog
        patientId={patientId}
        protocols={inviteProtocols}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onCreated={(invite) => setInvites((prev) => [invite, ...prev])}
      />
    </section>
  );
}
