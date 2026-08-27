"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClinicalEvaluationDTO } from "@/domains/patient/patient.types";
import { categoryOf } from "@/shared/constants/clinical-evaluation-domains";
import { cn } from "@/shared/lib/utils";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function ClinicalEvaluationViewDialog({
  evaluation,
  allEvaluations,
  onClose,
  onEdit,
  onDelete,
  onPreviewReport,
  pending,
}: {
  evaluation: ClinicalEvaluationDTO | null;
  allEvaluations: ClinicalEvaluationDTO[];
  onClose: () => void;
  onEdit: (ev: ClinicalEvaluationDTO) => void;
  onDelete: (id: string) => void;
  onPreviewReport: (ev: ClinicalEvaluationDTO) => void;
  pending: boolean;
}) {
  if (!evaluation) return null;

  const sorted = [...allEvaluations].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const firstEval = sorted[0];
  const showComparison =
    sorted.length > 1 && firstEval && firstEval.id !== evaluation.id;

  return (
    <Dialog open={!!evaluation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">
            Avaliação {evaluation.type} — {formatDateBR(evaluation.date)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {evaluation.diagnosis && (
            <p>
              <strong>Diagnóstico:</strong> {evaluation.diagnosis}
            </p>
          )}
          {evaluation.referredBy && (
            <p>
              <strong>Encaminhado por:</strong> {evaluation.referredBy}
            </p>
          )}
          <p>
            <strong>Queixa:</strong> {evaluation.complaint || "—"}
          </p>
          <p>
            <strong>História:</strong> {evaluation.history || "—"}
          </p>
          {evaluation.familyContext && (
            <p>
              <strong>Contexto familiar:</strong> {evaluation.familyContext}
            </p>
          )}
          {evaluation.previousLevel && (
            <p>
              <strong>Nível prévio:</strong> {evaluation.previousLevel}
            </p>
          )}
          {(evaluation.medications || evaluation.precautions) && (
            <p>
              {evaluation.medications && (
                <>
                  <strong>Medicações:</strong> {evaluation.medications}
                </>
              )}
              {evaluation.medications && evaluation.precautions && " · "}
              {evaluation.precautions && (
                <>
                  <strong>Precauções:</strong> {evaluation.precautions}
                </>
              )}
            </p>
          )}
          <div>
            <p className="mb-2 font-medium">Domínios</p>
            <div className="space-y-2">
              {evaluation.domains.map((d) => {
                const cat = categoryOf(d.categoryId);
                return (
                  <div key={d.categoryId}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: cat.color }}
                        />
                        {cat.label}
                      </span>
                      <span className="text-muted-foreground">{d.score}/4</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${(d.score / 4) * 100}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                    {d.note && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {d.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {showComparison && firstEval && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
              <p className="mb-2 text-xs font-medium text-primary">
                Evolução desde a avaliação inicial (
                {formatDateBR(firstEval.date)})
              </p>
              <div className="space-y-1">
                {evaluation.domains.map((d) => {
                  const before = firstEval.domains.find(
                    (x) => x.categoryId === d.categoryId,
                  );
                  const delta = before ? d.score - before.score : 0;
                  return (
                    <div
                      key={d.categoryId}
                      className="flex justify-between text-xs"
                    >
                      <span>{categoryOf(d.categoryId).label}</span>
                      <span
                        className={cn(
                          delta > 0 && "text-primary",
                          delta < 0 && "text-fichario-patient",
                          delta === 0 && "text-muted-foreground",
                        )}
                      >
                        {before ? before.score : "—"} → {d.score}
                        {delta > 0 ? " ↑" : delta < 0 ? " ↓" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {evaluation.equipment && (
            <p>
              <strong>Equipamentos:</strong> {evaluation.equipment}
            </p>
          )}
          <p>
            <strong>Objetivos:</strong> {evaluation.goals || "—"}
          </p>
          <p>
            <strong>Condutas:</strong> {evaluation.interventions || "—"}
          </p>
          {(evaluation.frequency || evaluation.dischargeCriteria) && (
            <p>
              {evaluation.frequency && (
                <>
                  <strong>Frequência:</strong> {evaluation.frequency}
                </>
              )}
              {evaluation.frequency && evaluation.dischargeCriteria && " · "}
              {evaluation.dischargeCriteria && (
                <>
                  <strong>Critérios de alta:</strong> {evaluation.dischargeCriteria}
                </>
              )}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <DeleteConfirmDialog
            onConfirm={() => onDelete(evaluation.id)}
            disabled={pending}
          >
            <Button variant="destructive" disabled={pending}>
              Excluir
            </Button>
          </DeleteConfirmDialog>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onPreviewReport(evaluation)}
            >
              <FileText className="size-4" />
              Relatório PDF
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={() => onEdit(evaluation)}>Editar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
