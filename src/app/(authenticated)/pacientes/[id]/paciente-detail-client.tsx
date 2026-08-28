"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AnamneseSummaryDTO } from "@/domains/anamnese/anamnese.types";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import {
  setPatientMembersAction,
  setPatientStatusAction,
} from "@/domains/patient/patient.actions";
import { PATIENT_STATUS_LABEL } from "@/shared/constants/patient-status";
import type { PatientDetailDTO } from "@/domains/patient/patient.types";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/domains/settings/settings.types";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import type { PublicInviteProtocolOption } from "@/features/protocol/components/create-protocol-invite-dialog";
import type { ProtocolInviteDTO } from "@/domains/protocol/invite/protocol-invite.types";
import type { AiTrialQuotaDTO } from "@/shared/constants/ai-limits";
import { PatientStatus } from "@prisma/enums";
import { AnamneseTab } from "./_components/anamnese-tab";
import { AvaliacaoTab } from "./_components/avaliacao-tab";
import { EvolucoesTab } from "./_components/evolucoes-tab";
import { LinksPublicosTab } from "./_components/links-publicos-tab";
import { usePatientDetail } from "./_components/hooks/use-patient-detail";
import { PatientDetailDialogs } from "./_components/patient-detail-dialogs";
import { PatientDetailHeader } from "./_components/patient-detail-header";
import { PatientDetailTabs } from "./_components/patient-detail-tabs";

type PendingStatusChange = {
  nextStatus: PatientStatus;
};

export function PacienteDetailClient({
  initial,
  initialGuardians,
  initialAnamneses,
  initialAnamneseSections,
  professional,
  branding,
  orgMembers,
  isLeadership,
  initialProtocolInvites,
  inviteProtocols,
  canWriteInvites,
  canUseAi,
  initialAiTrialQuota,
}: {
  initial: PatientDetailDTO;
  initialGuardians: GuardianDTO[];
  initialAnamneses: AnamneseSummaryDTO[];
  initialAnamneseSections: PdfKeyValueSection[];
  professional: ProfessionalProfile;
  branding: PrintBranding;
  orgMembers: TeamMemberDTO[];
  isLeadership: boolean;
  initialProtocolInvites: ProtocolInviteDTO[];
  inviteProtocols: PublicInviteProtocolOption[];
  canWriteInvites: boolean;
  canUseAi: boolean;
  initialAiTrialQuota: AiTrialQuotaDTO | null;
}) {
  const vm = usePatientDetail({
    initial,
    initialGuardians,
    initialAnamneses,
    initialAnamneseSections,
    professional,
    branding,
  });

  const [assignOpen, setAssignOpen] = useState(false);
  const [statusConfirm, setStatusConfirm] =
    useState<PendingStatusChange | null>(null);
  const [rosterPending, startRosterTransition] = useTransition();
  const busy = vm.pending || rosterPending;

  function requestStatusChange(nextStatus: PatientStatus) {
    if (!isLeadership || vm.detail.patient.status === nextStatus) return;
    if (
      nextStatus === PatientStatus.DISCHARGED ||
      nextStatus === PatientStatus.PAUSED
    ) {
      setStatusConfirm({ nextStatus });
      return;
    }
    applyStatusChange(nextStatus);
  }

  function applyStatusChange(status: PatientStatus) {
    startRosterTransition(async () => {
      const result = await setPatientStatusAction({
        id: vm.detail.patient.id,
        status,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      vm.setPatient(result.data);
      toast.success("Status atualizado");
    });
  }

  function saveMembers(memberIds: string[]) {
    startRosterTransition(async () => {
      const result = await setPatientMembersAction({
        patientId: vm.detail.patient.id,
        memberIds,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      vm.setPatient(result.data);
      setAssignOpen(false);
      toast.success("Profissionais atualizados");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <PatientDetailHeader
        patient={vm.detail.patient}
        orgMembers={orgMembers}
        isLeadership={isLeadership}
        pending={busy}
        assignOpen={assignOpen}
        onAssignOpenChange={setAssignOpen}
        onEdit={vm.patientEdit.openEditPatient}
        onPreviewReport={() => vm.previewReport("full")}
        onRemove={vm.removePatient}
        onRequestStatusChange={requestStatusChange}
        onSaveMembers={saveMembers}
      />

      <PatientDetailTabs tab={vm.tab} onTabChange={vm.setTab} />

      {vm.tab === "avaliacao" && (
        <AvaliacaoTab
          clinicalEvaluations={vm.detail.clinicalEvaluations}
          onNewEvaluation={vm.evaluations.openNewEvaluation}
          onViewEvaluation={vm.evaluations.setViewEval}
        />
      )}

      {vm.tab === "anamnese" && (
        <AnamneseTab
          patientId={vm.detail.patient.id}
          anamneses={vm.anamneses}
        />
      )}

      {vm.tab === "evolucoes" && (
        <EvolucoesTab
          sessionNotes={vm.detail.sessionNotes}
          onNewSession={vm.sessions.openNewSession}
          onViewSession={vm.sessions.setViewSession}
        />
      )}

      {vm.tab === "links-publicos" && (
        <LinksPublicosTab
          patientId={vm.detail.patient.id}
          initialInvites={initialProtocolInvites}
          inviteProtocols={inviteProtocols}
          canWriteInvites={canWriteInvites}
          canUseAi={canUseAi}
          initialAiTrialQuota={initialAiTrialQuota}
        />
      )}

      <PatientDetailDialogs vm={vm} />

      <AlertDialog
        open={statusConfirm != null}
        onOpenChange={(next) => {
          if (!next) setStatusConfirm(null);
        }}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusConfirm?.nextStatus === PatientStatus.DISCHARGED
                ? "Marcar alta?"
                : "Pausar paciente?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusConfirm?.nextStatus === PatientStatus.DISCHARGED
                ? `«${vm.detail.patient.name}» passa a ${PATIENT_STATUS_LABEL.DISCHARGED}. Pode reativar depois se precisar.`
                : `«${vm.detail.patient.name}» fica ${PATIENT_STATUS_LABEL.PAUSED} até voltar a Ativo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!statusConfirm) return;
                const { nextStatus } = statusConfirm;
                setStatusConfirm(null);
                applyStatusChange(nextStatus);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
