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
import type { AnamneseSummaryDTO } from "@/features/anamnese/anamnese.types";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import {
  setPatientMembersAction,
  setPatientStatusAction,
} from "@/features/patient/patient.actions";
import { PATIENT_STATUS_LABEL } from "@/features/patient/_lib/patient-status-label";
import type {
  PatientDetailDTO,
  PatientStatus,
} from "@/features/patient/patient.types";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/features/settings/settings.types";
import type { TeamMemberDTO } from "@/features/team/team.types";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import { AnamneseTab } from "./_components/anamnese-tab";
import { AvaliacaoTab } from "./_components/avaliacao-tab";
import { EvolucoesTab } from "./_components/evolucoes-tab";
import { RoteirosTab } from "./_components/roteiros-tab";
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
  showRoteiros,
  orgMembers,
  isLeadership,
}: {
  initial: PatientDetailDTO;
  initialGuardians: GuardianDTO[];
  initialAnamneses: AnamneseSummaryDTO[];
  initialAnamneseSections: PdfKeyValueSection[];
  professional: ProfessionalProfile;
  branding: PrintBranding;
  showRoteiros: boolean;
  orgMembers: TeamMemberDTO[];
  isLeadership: boolean;
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
    if (nextStatus === "discharged" || nextStatus === "paused") {
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

      <PatientDetailTabs
        tab={vm.tab}
        onTabChange={vm.setTab}
        showRoteiros={showRoteiros}
      />

      {vm.tab === "avaliacao" && (
        <AvaliacaoTab
          clinicalEvaluations={vm.detail.clinicalEvaluations}
          onNewEvaluation={vm.evaluations.openNewEvaluation}
          onViewEvaluation={vm.evaluations.setViewEval}
        />
      )}

      {vm.tab === "roteiros" && showRoteiros && (
        <RoteirosTab
          roteiroId={vm.roteiro.roteiroId}
          currentRoteiro={vm.roteiro.currentRoteiro}
          currentCategory={vm.roteiro.currentCategory}
          roteiroDraft={vm.roteiro.roteiroDraft}
          currentRoteiroNote={vm.roteiro.currentRoteiroNote}
          pending={vm.roteiro.pending}
          onOpenRoteiro={vm.roteiro.openRoteiro}
          onSelectTick={vm.roteiro.selectTick}
          onRoteiroDraftChange={vm.roteiro.setRoteiroDraft}
          onSaveRoteiroNote={vm.roteiro.saveCurrentRoteiroNote}
          onPreviewRoteiro={() => vm.previewReport("roteiro")}
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
              {statusConfirm?.nextStatus === "discharged"
                ? "Marcar alta?"
                : "Pausar paciente?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusConfirm?.nextStatus === "discharged"
                ? `«${vm.detail.patient.name}» passa a ${PATIENT_STATUS_LABEL.discharged}. Pode reativar depois se precisar.`
                : `«${vm.detail.patient.name}» fica ${PATIENT_STATUS_LABEL.paused} até voltar a Ativo.`}
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
