"use client";

import { PatientPdfPreviewDialog } from "./patient-pdf-preview-dialog";
import { EvolutionFormDialog } from "@/features/evolution/components/evolution-form-dialog";
import { EvolutionViewDialog } from "./evolution-view-dialog";
import { EditPatientDialog } from "./edit-patient-dialog";
import { AssessmentFormDialog } from "./assessment-form-dialog";
import { AssessmentViewDialog } from "./assessment-view-dialog";
import type { PatientDetailViewModel } from "./hooks/use-patient-detail";

export function PatientDetailDialogs({ vm }: { vm: PatientDetailViewModel }) {
  const {
    detail,
    assessments,
    appointments,
    pdfReport,
    previewReport,
    patientEdit,
    evaluations,
    sessions,
  } = vm;

  return (
    <>
      {evaluations.evalOpen && (
        <AssessmentFormDialog
          key={evaluations.editingEval?.id ?? "new-eval"}
          open={evaluations.evalOpen}
          onOpenChange={evaluations.setEvalOpen}
          patientId={detail.patient.id}
          initial={evaluations.editingEval}
          pending={evaluations.pending}
          onSave={evaluations.saveEvaluation}
          startTransition={evaluations.startTransition}
        />
      )}

      <AssessmentViewDialog
        assessment={evaluations.viewEval}
        allAssessments={assessments}
        onClose={() => evaluations.setViewEval(null)}
        onEdit={evaluations.openEditEvaluation}
        onDelete={evaluations.deleteAssessment}
        onPreviewReport={(ev) => previewReport("evaluation", ev)}
        pending={evaluations.pending}
      />

      {sessions.sessionOpen && (
        <EvolutionFormDialog
          key={sessions.editingSession?.id ?? "new-session"}
          open={sessions.sessionOpen}
          onOpenChange={sessions.setSessionOpen}
          patientId={detail.patient.id}
          appointments={appointments}
          initial={sessions.editingSession}
          pending={sessions.pending}
          startTransition={sessions.startTransition}
          onSave={sessions.saveSession}
        />
      )}

      <EvolutionViewDialog
        note={sessions.viewSession}
        onClose={() => sessions.setViewSession(null)}
        onEdit={sessions.openEditSession}
        onDelete={sessions.deleteSession}
        pending={sessions.pending}
      />

      {patientEdit.editPatientOpen && (
        <EditPatientDialog
          open={patientEdit.editPatientOpen}
          onOpenChange={patientEdit.setEditPatientOpen}
          patientForm={patientEdit.patientForm}
          guardianId={patientEdit.editGuardianId}
          onGuardianIdChange={patientEdit.handleGuardianIdChange}
          guardians={patientEdit.guardians}
          guardianForm={patientEdit.guardianForm}
          guardianEmail={patientEdit.guardianEmail}
          hasPortalAccess={patientEdit.hasPortalAccess}
          pending={patientEdit.pending}
          onSave={patientEdit.savePatientEdit}
          onEnablePortal={patientEdit.enablePortal}
        />
      )}

      <PatientPdfPreviewDialog
        payload={pdfReport.previewPayload}
        onClose={pdfReport.closePreview}
      />
    </>
  );
}
