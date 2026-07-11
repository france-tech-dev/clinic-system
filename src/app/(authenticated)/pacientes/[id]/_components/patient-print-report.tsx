import type {
  EvaluationDTO,
  PatientDetailDTO,
  RoteiroNoteDTO,
} from "@/features/patient/patient.types";
import { ANAMNESE_SCHEMA } from "@/features/patient/_lib/anamnese-schema";
import type { ProfessionalProfile } from "@/features/settings/settings.types";
import { categoryOf } from "@/shared/constants/exercise-categories";
import type { Roteiro, RoteiroCategory } from "@/shared/constants/roteiros";
import { cn } from "@/shared/lib/utils";
import { formatDateBR } from "@/shared/lib/format-date-br";

export type PatientPrintMode = "full" | "anamnese" | "evaluation" | "roteiro";

export function PatientPrintReport({
  printMode,
  detail,
  professional,
  signature,
  printEval,
  anamneseData,
  currentRoteiro,
  currentCategory,
  roteiroDraft,
  currentRoteiroNote,
}: {
  printMode: PatientPrintMode | null;
  detail: PatientDetailDTO;
  professional: ProfessionalProfile;
  signature: string;
  printEval: EvaluationDTO | null;
  anamneseData: Record<string, unknown>;
  currentRoteiro: Roteiro;
  currentCategory: RoteiroCategory;
  roteiroDraft: string;
  currentRoteiroNote: RoteiroNoteDTO | undefined;
}) {
  return (
    <div
      className={cn(
        "print-report hidden space-y-4",
        printMode && "print:block",
      )}
    >
      <div className="rep-top">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Fichário TO</h1>
          <h2 className="text-lg">
            {printMode === "anamnese"
              ? "Anamnese de Terapia Ocupacional"
              : printMode === "evaluation"
                ? "Relatório de Avaliação Ocupacional"
                : printMode === "roteiro"
                  ? `Roteiro — ${currentRoteiro.label}`
                  : "Prontuário Completo"}
          </h2>
        </div>
        {professional.clinica && (
          <p className="text-sm text-muted-foreground">
            {professional.clinica}
          </p>
        )}
      </div>
      <p className="text-sm">
        Paciente: <strong>{detail.patient.name}</strong>
      </p>

      {(printMode === "full" || printMode === "evaluation") && (
        <>
          {(printMode === "evaluation" && printEval
            ? [printEval]
            : detail.evaluations
          ).map((e) => (
            <div key={e.id} className="mb-4 space-y-2 text-sm">
              <h3 className="font-serif text-base font-semibold">
                Avaliação {e.tipo} — {formatDateBR(e.date)}
              </h3>
              {e.diagnostico && <p>Diagnóstico: {e.diagnostico}</p>}
              {e.encaminhadoPor && <p>Encaminhado por: {e.encaminhadoPor}</p>}
              <p>Queixa: {e.queixa || "—"}</p>
              <p>História: {e.historia || "—"}</p>
              {e.contextoFamiliar && (
                <p>Contexto familiar: {e.contextoFamiliar}</p>
              )}
              <ul>
                {e.domains.map((d) => (
                  <li key={d.categoryId}>
                    {categoryOf(d.categoryId).label}: {d.score}/4
                    {d.note ? ` — ${d.note}` : ""}
                  </li>
                ))}
              </ul>
              <p>Objetivos: {e.objetivos || "—"}</p>
              <p>Condutas: {e.condutas || "—"}</p>
              {e.frequencia && <p>Frequência: {e.frequencia}</p>}
              {e.criteriosAlta && <p>Critérios de alta: {e.criteriosAlta}</p>}
            </div>
          ))}
        </>
      )}

      {(printMode === "full" || printMode === "anamnese") && (
        <div className="space-y-3 text-sm">
          <h3 className="font-serif text-base font-semibold">Anamnese</h3>
          {ANAMNESE_SCHEMA.map((sec) => (
            <div key={sec.id}>
              <p className="font-medium">{sec.title}</p>
              <ul className="ml-4 list-disc">
                {sec.fields.map((field) => {
                  const val = String(anamneseData[field.id] ?? "").trim();
                  if (
                    !val &&
                    field.type !== "rating-grid" &&
                    field.type !== "status-table"
                  )
                    return null;
                  if (field.type === "rating-grid" && field.items) {
                    return field.items.map((item) => {
                      const v = String(
                        anamneseData[`${field.id}::${item}`] ?? "",
                      ).trim();
                      if (!v) return null;
                      return (
                        <li key={`${field.id}-${item}`}>
                          {item}: {v}
                        </li>
                      );
                    });
                  }
                  if (
                    field.type === "status-table" &&
                    Array.isArray(field.rows)
                  ) {
                    return field.rows.map((row) => {
                      const v = String(
                        anamneseData[`${field.id}::${row}`] ?? "",
                      ).trim();
                      if (!v) return null;
                      return (
                        <li key={`${field.id}-${row}`}>
                          {row}: {v}
                        </li>
                      );
                    });
                  }
                  return (
                    <li key={field.id}>
                      {field.label}: {val}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {printMode === "full" && (
        <>
          <h3 className="font-serif text-base font-semibold">Plano</h3>
          <ul className="list-disc pl-4 text-sm">
            {detail.planItems.map((p) => (
              <li key={p.id}>
                {p.exerciseTitle} — {p.objective}
              </li>
            ))}
          </ul>
          <h3 className="font-serif text-base font-semibold">Evoluções</h3>
          {detail.sessionNotes.map((s) => (
            <div key={s.id} className="mb-2 text-sm">
              <p>
                <strong>
                  {formatDateBR(s.date)} — {s.status}
                </strong>
              </p>
              <p>{s.atividades}</p>
              {s.observacoes && <p>{s.observacoes}</p>}
            </div>
          ))}
        </>
      )}

      {printMode === "roteiro" && (
        <div className="space-y-3 text-sm">
          <h3 className="font-serif text-base font-semibold">
            {currentCategory.title}
          </h3>
          <p className="italic text-muted-foreground">
            {currentCategory.context}
          </p>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1 pr-2 font-medium">Item</th>
                <th className="py-1 pr-2 font-medium">O que observar</th>
                <th className="py-1 font-medium">Leitura clínica</th>
              </tr>
            </thead>
            <tbody>
              {currentCategory.rows.map((row) => (
                <tr key={row[0]} className="border-b border-border align-top">
                  <td className="py-1.5 pr-2 font-medium">{row[0]}</td>
                  <td className="py-1.5 pr-2">{row[1]}</td>
                  <td className="py-1.5">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(roteiroDraft.trim() || currentRoteiroNote?.notes) && (
            <div>
              <p className="font-medium">Notas de caso</p>
              <p className="whitespace-pre-wrap">
                {roteiroDraft.trim() || currentRoteiroNote?.notes}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 border-t border-border pt-6 text-sm">
        <p>{signature}</p>
        {professional.clinica && (
          <p className="text-muted-foreground">{professional.clinica}</p>
        )}
      </div>
    </div>
  );
}
