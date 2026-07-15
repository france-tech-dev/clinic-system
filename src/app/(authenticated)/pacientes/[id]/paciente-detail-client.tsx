"use client";

import type { PatientDetailDTO } from "@/features/patient/patient.types";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/features/settings/settings.types";
import { AnamneseTab } from "./_components/anamnese-tab";
import { AvaliacaoTab } from "./_components/avaliacao-tab";
import { EvolucoesTab } from "./_components/evolucoes-tab";
import { usePatientDetail } from "./_components/hooks/use-patient-detail";
import { PatientDetailDialogs } from "./_components/patient-detail-dialogs";
import { PatientDetailHeader } from "./_components/patient-detail-header";
import { PatientDetailTabs } from "./_components/patient-detail-tabs";

export function PacienteDetailClient({
  initial,
  professional,
  branding,
}: {
  initial: PatientDetailDTO;
  professional: ProfessionalProfile;
  branding: PrintBranding;
}) {
  const vm = usePatientDetail({ initial, professional, branding });

  return (
    <div className="flex flex-col gap-4">
      <PatientDetailHeader
        notes={vm.detail.patient.notes}
        pending={vm.pending}
        onEdit={vm.patientEdit.openEditPatient}
        onPreviewReport={() => vm.previewReport("full")}
        onRemove={vm.removePatient}
      />

      <PatientDetailTabs tab={vm.tab} onTabChange={vm.setTab} />

      {vm.tab === "avaliacao" && (
        <AvaliacaoTab
          evaluations={vm.detail.evaluations}
          avaliacaoView={vm.roteiro.avaliacaoView}
          roteiroId={vm.roteiro.roteiroId}
          currentRoteiro={vm.roteiro.currentRoteiro}
          currentCategory={vm.roteiro.currentCategory}
          roteiroDraft={vm.roteiro.roteiroDraft}
          currentRoteiroNote={vm.roteiro.currentRoteiroNote}
          pending={vm.roteiro.pending}
          onAvaliacaoViewChange={vm.roteiro.setAvaliacaoView}
          onOpenRoteiro={vm.roteiro.openRoteiro}
          onNewEvaluation={vm.evaluations.openNewEvaluation}
          onViewEvaluation={vm.evaluations.setViewEval}
          onSelectTick={vm.roteiro.selectTick}
          onRoteiroDraftChange={vm.roteiro.setRoteiroDraft}
          onSaveRoteiroNote={vm.roteiro.saveCurrentRoteiroNote}
          onPreviewRoteiro={() => vm.previewReport("roteiro")}
        />
      )}

      {vm.tab === "anamnese" && (
        <AnamneseTab
          data={vm.anamnese.anamneseData}
          onChange={vm.anamnese.setAnamneseData}
          pending={vm.anamnese.pending}
          onSave={vm.anamnese.saveAnamnese}
          onPreviewReport={() => vm.previewReport("anamnese")}
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
    </div>
  );
}
