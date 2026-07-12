"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import { categoryOf } from "@/shared/constants/exercise-categories";
import { cn } from "@/shared/lib/utils";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function EvaluationViewDialog({
  evaluation,
  allEvaluations,
  exercises,
  onClose,
  onEdit,
  onDelete,
  onPreviewReport,
  pending,
}: {
  evaluation: EvaluationDTO | null;
  allEvaluations: EvaluationDTO[];
  exercises: ExerciseDTO[];
  onClose: () => void;
  onEdit: (ev: EvaluationDTO) => void;
  onDelete: (id: string) => void;
  onPreviewReport: (ev: EvaluationDTO) => void;
  pending: boolean;
}) {
  if (!evaluation) return null;

  const sorted = [...allEvaluations].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const firstEval = sorted[0];
  const showComparison =
    sorted.length > 1 && firstEval && firstEval.id !== evaluation.id;

  const weakDomains = evaluation.domains
    .filter((d) => d.score <= 2)
    .map((d) => d.categoryId);
  const suggestions = exercises
    .filter((e) => weakDomains.includes(e.categoryId))
    .slice(0, 5);

  return (
    <Dialog open={!!evaluation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">
            Avaliação {evaluation.tipo} — {formatDateBR(evaluation.date)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {evaluation.diagnostico && (
            <p>
              <strong>Diagnóstico:</strong> {evaluation.diagnostico}
            </p>
          )}
          {evaluation.encaminhadoPor && (
            <p>
              <strong>Encaminhado por:</strong> {evaluation.encaminhadoPor}
            </p>
          )}
          <p>
            <strong>Queixa:</strong> {evaluation.queixa || "—"}
          </p>
          <p>
            <strong>História:</strong> {evaluation.historia || "—"}
          </p>
          {evaluation.contextoFamiliar && (
            <p>
              <strong>Contexto familiar:</strong> {evaluation.contextoFamiliar}
            </p>
          )}
          {evaluation.nivelPrevio && (
            <p>
              <strong>Nível prévio:</strong> {evaluation.nivelPrevio}
            </p>
          )}
          {(evaluation.medicacoes || evaluation.precaucoes) && (
            <p>
              {evaluation.medicacoes && (
                <>
                  <strong>Medicações:</strong> {evaluation.medicacoes}
                </>
              )}
              {evaluation.medicacoes && evaluation.precaucoes && " · "}
              {evaluation.precaucoes && (
                <>
                  <strong>Precauções:</strong> {evaluation.precaucoes}
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
          {evaluation.equipamentos && (
            <p>
              <strong>Equipamentos:</strong> {evaluation.equipamentos}
            </p>
          )}
          <p>
            <strong>Objetivos:</strong> {evaluation.objetivos || "—"}
          </p>
          <p>
            <strong>Condutas:</strong> {evaluation.condutas || "—"}
          </p>
          {(evaluation.frequencia || evaluation.criteriosAlta) && (
            <p>
              {evaluation.frequencia && (
                <>
                  <strong>Frequência:</strong> {evaluation.frequencia}
                </>
              )}
              {evaluation.frequencia && evaluation.criteriosAlta && " · "}
              {evaluation.criteriosAlta && (
                <>
                  <strong>Critérios de alta:</strong> {evaluation.criteriosAlta}
                </>
              )}
            </p>
          )}
          {suggestions.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Atividades sugeridas (domínios baixos)
              </p>
              <ul className="list-disc space-y-0.5 pl-4 text-xs">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    {s.title}{" "}
                    <span className="text-muted-foreground">
                      ({categoryOf(s.categoryId).label})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => onDelete(evaluation.id)}
          >
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
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
