"use client";

import { EditPatientDialog } from "./edit-patient-dialog";
import { EvaluationFormDialog } from "./evaluation-form-dialog";
import { EvaluationViewDialog } from "./evaluation-view-dialog";
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
        <EvaluationFormDialog
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

      <EvaluationViewDialog
        evaluation={evaluations.viewEval}
        allEvaluations={detail.evaluations}
        onClose={() => evaluations.setViewEval(null)}
        onEdit={evaluations.openEditEvaluation}
        onDelete={evaluations.deleteEvaluation}
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
          name={patientEdit.editName}
          onNameChange={patientEdit.setEditName}
          notes={patientEdit.editNotes}
          onNotesChange={patientEdit.setEditNotes}
          pricingType={patientEdit.editPricingType}
          onPricingTypeChange={patientEdit.setEditPricingType}
          priceInput={patientEdit.editPriceInput}
          onPriceInputChange={patientEdit.setEditPriceInput}
          pending={patientEdit.pending}
          onSave={patientEdit.savePatientEdit}
        />
      )}

      <PatientPdfPreviewDialog
        payload={pdfReport.previewPayload}
        onClose={pdfReport.closePreview}
      />
    </>
  );
}
