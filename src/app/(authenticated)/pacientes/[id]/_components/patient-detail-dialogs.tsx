"use client";

import { EditPatientDialog } from "./edit-patient-dialog";
import { ClinicalEvaluationFormDialog } from "./clinical-evaluation-form-dialog";
import { ClinicalEvaluationViewDialog } from "./clinical-evaluation-view-dialog";
import type { PatientDetailViewModel } from "./hooks/use-patient-detail";
import { PatientPdfPreviewDialog } from "@/features/patient/components/patient-pdf-preview-dialog";
import { SessionFormDialog } from "@/features/patient/components/session-form-dialog";
import { SessionViewDialog } from "./session-view-dialog";

export function PatientDetailDialogs({ vm }: { vm: PatientDetailViewModel }) {
  const {
    detail,
    pdfReport,
    previewReport,
    patientEdit,
    evaluations,
    sessions,
  } = vm;

  return (
    <>
      {evaluations.evalOpen && (
        <ClinicalEvaluationFormDialog
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

      <ClinicalEvaluationViewDialog
        evaluation={evaluations.viewEval}
        allEvaluations={detail.clinicalEvaluations}
        onClose={() => evaluations.setViewEval(null)}
        onEdit={evaluations.openEditEvaluation}
        onDelete={evaluations.deleteClinicalEvaluation}
        onPreviewReport={(ev) => previewReport("evaluation", ev)}
        pending={evaluations.pending}
      />

      {sessions.sessionOpen && (
        <SessionFormDialog
          key={sessions.editingSession?.id ?? "new-session"}
          open={sessions.sessionOpen}
          onOpenChange={sessions.setSessionOpen}
          patientId={detail.patient.id}
          appointments={detail.appointments}
          initial={sessions.editingSession}
          pending={sessions.pending}
          startTransition={sessions.startTransition}
          onSave={sessions.saveSession}
        />
      )}

      <SessionViewDialog
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
