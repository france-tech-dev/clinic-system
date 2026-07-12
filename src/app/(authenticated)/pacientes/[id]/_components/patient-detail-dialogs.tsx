"use client";

import { AssignExerciseDialog } from "./assign-exercise-dialog";
import { EditPatientDialog } from "./edit-patient-dialog";
import { EvaluationFormDialog } from "./evaluation-form-dialog";
import { EvaluationViewDialog } from "./evaluation-view-dialog";
import type { PatientDetailViewModel } from "./hooks/use-patient-detail";
import { PatientPdfPreviewDialog } from "./patient-pdf-preview-dialog";
import { SessionFormDialog } from "./session-form-dialog";
import { SessionViewDialog } from "./session-view-dialog";

export function PatientDetailDialogs({ vm }: { vm: PatientDetailViewModel }) {
  const {
    detail,
    exercises,
    pdfReport,
    previewReport,
    plan,
    patientEdit,
    evaluations,
    sessions,
  } = vm;

  return (
    <>
      <AssignExerciseDialog
        open={plan.assignOpen}
        onOpenChange={plan.setAssignOpen}
        patientName={detail.patient.name}
        assignSearch={plan.assignSearch}
        onAssignSearchChange={plan.setAssignSearch}
        assignCat={plan.assignCat}
        onAssignCatChange={plan.setAssignCat}
        assignList={plan.assignList}
        assignedIds={plan.assignedIds}
        pending={plan.pending}
        onAssign={plan.assign}
      />

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
        exercises={exercises}
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
