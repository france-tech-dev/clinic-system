"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assignExerciseAction,
  createEvaluationAction,
  createSessionAction,
  deleteEvaluationAction,
  deletePatientAction,
  deleteSessionAction,
  removePlanItemAction,
  saveAnamneseAction,
  saveRoteiroNoteAction,
  updateEvaluationAction,
  updatePatientAction,
  updateSessionAction,
} from "@/features/patient/patient.actions";
import type {
  EvaluationDTO,
  PatientDetailDTO,
  SessionNoteDTO,
} from "@/features/patient/patient.types";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import { ANAMNESE_SCHEMA } from "@/features/patient/_lib/anamnese-schema";
import type { ProfessionalProfile } from "@/features/settings/settings.types";
import { formatProfessionalSignature } from "@/features/settings/settings.types";
import {
  EXERCISE_CATEGORIES,
  categoryOf,
} from "@/shared/constants/exercise-categories";
import {
  ROTEIROS,
  roteiroById,
  roteiroCategoryByTick,
  type RoteiroId,
} from "@/shared/constants/roteiros";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { useRouter } from "next/navigation";

type SubTab = "plano" | "avaliacao" | "anamnese" | "evolucoes";
type AvaliacaoView = "lista" | "roteiro";

export function PacienteDetailClient({
  initial,
  exercises,
  professional,
}: {
  initial: PatientDetailDTO;
  exercises: ExerciseDTO[];
  professional: ProfessionalProfile;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState(initial);
  const [tab, setTab] = useState<SubTab>("plano");
  const [avaliacaoView, setAvaliacaoView] = useState<AvaliacaoView>("lista");
  const [roteiroId, setRoteiroId] = useState<RoteiroId>("si");
  const [roteiroTick, setRoteiroTick] = useState(ROTEIROS[0].categories[0].tick);
  const [roteiroNotes, setRoteiroNotes] = useState(detail.roteiroNotes);
  const [roteiroDraft, setRoteiroDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [printMode, setPrintMode] = useState<
    "full" | "anamnese" | "evaluation" | "roteiro" | null
  >(null);
  const [printEval, setPrintEval] = useState<EvaluationDTO | null>(null);

  // Plan assign
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCat, setAssignCat] = useState<string | null>(null);

  // Edit patient
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [editName, setEditName] = useState(detail.patient.name);
  const [editNotes, setEditNotes] = useState(detail.patient.notes);

  // Evaluation
  const [evalOpen, setEvalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<EvaluationDTO | null>(null);
  const [viewEval, setViewEval] = useState<EvaluationDTO | null>(null);

  // Session
  const [sessionOpen, setSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionNoteDTO | null>(
    null,
  );
  const [viewSession, setViewSession] = useState<SessionNoteDTO | null>(null);

  // Anamnese local
  const [anamneseData, setAnamneseData] = useState(detail.anamneseData);

  const signature = formatProfessionalSignature(professional);

  const currentRoteiro = roteiroById(roteiroId);
  const currentCategory = roteiroCategoryByTick(currentRoteiro, roteiroTick);
  const currentRoteiroNote = roteiroNotes.find(
    (n) =>
      n.roteiroId === roteiroId && n.categoryTick === currentCategory.tick,
  );

  const assignedIds = new Set(detail.planItems.map((p) => p.exerciseId));

  const assignQ = assignSearch.trim().toLowerCase();
  const assignList = exercises.filter((e) => {
    const matchCat = !assignCat || e.categoryId === assignCat;
    const matchQ = !assignQ || e.title.toLowerCase().includes(assignQ);
    return matchCat && matchQ;
  });

  function refreshFromServer() {
    router.refresh();
  }

  function removePatient() {
    if (
      !confirm(
        `Remover ${detail.patient.name} e todos os dados associados?`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deletePatientAction({ id: detail.patient.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Paciente removido");
      router.push(paths.pacientes);
    });
  }

  function assign(exerciseId: string) {
    startTransition(async () => {
      const result = await assignExerciseAction({
        patientId: detail.patient.id,
        exerciseId,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({
        ...d,
        planItems: [result.data, ...d.planItems.filter((p) => p.id !== result.data.id)],
      }));
      toast.success("Atividade atribuída");
    });
  }

  function removePlan(id: string) {
    startTransition(async () => {
      const result = await removePlanItemAction({ id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({
        ...d,
        planItems: d.planItems.filter((p) => p.id !== id),
      }));
    });
  }

  function saveAnamnese() {
    startTransition(async () => {
      const result = await saveAnamneseAction({
        patientId: detail.patient.id,
        data: anamneseData,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({ ...d, anamneseData }));
      toast.success("Anamnese salva");
      refreshFromServer();
    });
  }

  function savePatientEdit() {
    startTransition(async () => {
      const result = await updatePatientAction({
        id: detail.patient.id,
        name: editName,
        notes: editNotes,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({ ...d, patient: { ...d.patient, ...result.data } }));
      setEditPatientOpen(false);
      toast.success("Paciente atualizado");
    });
  }

  function runPrint(
    mode: "full" | "anamnese" | "evaluation" | "roteiro",
    evaluation?: EvaluationDTO,
  ) {
    setPrintMode(mode);
    setPrintEval(evaluation ?? null);
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => {
        setPrintMode(null);
        setPrintEval(null);
      }, 300);
    });
  }

  function openRoteiro(id: RoteiroId) {
    const r = roteiroById(id);
    setRoteiroId(id);
    setRoteiroTick(r.categories[0].tick);
    const note = roteiroNotes.find(
      (n) => n.roteiroId === id && n.categoryTick === r.categories[0].tick,
    );
    setRoteiroDraft(note?.notes ?? "");
    setAvaliacaoView("roteiro");
  }

  function selectTick(tick: string) {
    setRoteiroTick(tick);
    const note = roteiroNotes.find(
      (n) => n.roteiroId === roteiroId && n.categoryTick === tick,
    );
    setRoteiroDraft(note?.notes ?? "");
  }

  function saveCurrentRoteiroNote() {
    startTransition(async () => {
      const result = await saveRoteiroNoteAction({
        patientId: detail.patient.id,
        roteiroId,
        categoryTick: currentCategory.tick,
        notes: roteiroDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setRoteiroNotes((prev) => {
        const without = prev.filter(
          (n) =>
            !(
              n.roteiroId === result.data.roteiroId &&
              n.categoryTick === result.data.categoryTick
            ),
        );
        return [...without, result.data];
      });
      toast.success("Notas do roteiro salvas");
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="no-print flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={paths.pacientes}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Pacientes
          </Link>
          <h2 className="font-serif text-2xl font-semibold">
            {detail.patient.name}
          </h2>
          {detail.patient.notes && (
            <p className="mt-1 text-sm text-muted-foreground">
              {detail.patient.notes}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(detail.patient.name);
              setEditNotes(detail.patient.notes);
              setEditPatientOpen(true);
            }}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runPrint("full")}
          >
            <Printer className="size-4" />
            Prontuário
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={removePatient}
          >
            <Trash2 className="size-4" />
            Remover
          </Button>
        </div>
      </div>

      <div className="no-print flex gap-4 overflow-x-auto border-b border-border">
        {(
          [
            ["plano", "Plano de Atividades"],
            ["avaliacao", "Avaliação"],
            ["anamnese", "Anamnese"],
            ["evolucoes", "Evoluções"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 border-b-2 pb-2 text-sm font-medium",
              tab === id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "plano" && (
        <section className="space-y-3">
          <div className="no-print flex justify-end">
            <Button size="sm" onClick={() => setAssignOpen(true)}>
              <Plus className="size-4" />
              Atribuir atividade
            </Button>
          </div>
          {detail.planItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade no plano.
            </p>
          ) : (
            <ul className="space-y-2">
              {detail.planItems.map((item) => {
                const cat = categoryOf(item.categoryId);
                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-md border border-border bg-card px-3 py-3"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: cat.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {cat.label}
                        </span>
                      </div>
                      <p className="font-medium">{item.exerciseTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.objective}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="no-print"
                      onClick={() => removePlan(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "avaliacao" && (
        <section className="space-y-4">
          <div className="no-print flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAvaliacaoView("lista")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                avaliacaoView === "lista"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "text-muted-foreground",
              )}
            >
              Avaliações
            </button>
            {ROTEIROS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => openRoteiro(r.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  avaliacaoView === "roteiro" && roteiroId === r.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {avaliacaoView === "lista" && (
            <>
              <div className="no-print flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingEval(null);
                    setEvalOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Nova avaliação
                </Button>
              </div>
              {detail.evaluations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma avaliação registrada. Use também os roteiros clínicos
                  acima (SI, grafomotor, alimentação).
                </p>
              ) : (
                <ul className="space-y-2">
                  {detail.evaluations.map((ev) => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        onClick={() => setViewEval(ev)}
                        className="w-full rounded-md border border-border bg-card px-3 py-3 text-left hover:border-primary/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium capitalize">
                            Avaliação {ev.tipo}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatDateBR(ev.date)}
                          </span>
                        </div>
                        {ev.queixa && (
                          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                            {ev.queixa}
                          </p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {avaliacaoView === "roteiro" && (
            <div className="space-y-4">
              <div className="no-print flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                {currentRoteiro.categories.map((cat, idx) => (
                  <button
                    key={cat.tick}
                    type="button"
                    onClick={() => selectTick(cat.tick)}
                    className={cn(
                      "shrink-0 rounded-md border px-2.5 py-1.5 text-left",
                      cat.tick === currentCategory.tick
                        ? "border-primary bg-primary/10"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <span className="block font-mono text-[0.625rem] tracking-wide">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-medium">{cat.tick}</span>
                  </button>
                ))}
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold">
                  {currentCategory.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground italic">
                  {currentCategory.context}
                </p>
              </div>

              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium">O que observar</th>
                      <th className="px-3 py-2 font-medium">Leitura clínica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategory.rows.map((row) => (
                      <tr
                        key={row[0]}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-3 py-2 align-top font-medium">
                          {row[0]}
                        </td>
                        <td className="px-3 py-2 align-top text-muted-foreground">
                          {row[1]}
                        </td>
                        <td className="px-3 py-2 align-top text-muted-foreground">
                          {row[2]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-1.5">
                <Label>Notas de caso — {currentCategory.title}</Label>
                <Textarea
                  rows={4}
                  value={roteiroDraft}
                  onChange={(e) => setRoteiroDraft(e.target.value)}
                  placeholder="Padrões observados nesta criança, cruzando itens de diferentes categorias…"
                />
                {currentRoteiroNote && (
                  <p className="text-xs text-muted-foreground">
                    Última atualização:{" "}
                    {new Date(currentRoteiroNote.updatedAt).toLocaleString(
                      "pt-BR",
                    )}
                  </p>
                )}
              </div>

              <div className="no-print flex flex-wrap gap-2">
                <Button disabled={pending} onClick={saveCurrentRoteiroNote}>
                  Salvar notas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runPrint("roteiro")}
                >
                  <Printer className="size-4" />
                  Imprimir esta seção
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === "anamnese" && (
        <section className="space-y-6">
          {ANAMNESE_SCHEMA.map((sec) => (
            <div
              key={sec.id}
              className="rounded-md border border-border bg-card p-4"
            >
              <h3 className="font-serif mb-3 text-lg font-semibold">
                {sec.title}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {sec.fields.map((field) => {
                  const value = String(anamneseData[field.id] ?? "");
                  const wide =
                    field.w === "lg" ||
                    field.type === "textarea" ||
                    field.type === "check" ||
                    field.type === "rating-grid" ||
                    field.type === "status-table";
                  const textareaRows =
                    typeof field.rows === "number" ? field.rows : 3;
                  return (
                    <div
                      key={field.id}
                      className={cn("grid gap-1.5", wide && "sm:col-span-2")}
                    >
                      <Label className="text-xs">{field.label}</Label>
                      {field.hint && (
                        <p className="text-xs text-muted-foreground">
                          {field.hint}
                        </p>
                      )}
                      {field.type === "textarea" ? (
                        <Textarea
                          rows={textareaRows}
                          value={value}
                          onChange={(e) =>
                            setAnamneseData((d) => ({
                              ...d,
                              [field.id]: e.target.value,
                            }))
                          }
                        />
                      ) : field.type === "rating-grid" && field.items ? (
                        <div className="space-y-2">
                          {field.items.map((item) => {
                            const key = `${field.id}::${item}`;
                            const itemVal = String(anamneseData[key] ?? "");
                            return (
                              <div
                                key={item}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="text-sm">{item}</span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  className="w-20"
                                  value={itemVal}
                                  onChange={(e) =>
                                    setAnamneseData((d) => ({
                                      ...d,
                                      [key]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : field.type === "status-table" &&
                        Array.isArray(field.rows) ? (
                        <div className="space-y-2">
                          {field.rows.map((row) => {
                            const key = `${field.id}::${row}`;
                            const rowVal = String(anamneseData[key] ?? "");
                            return (
                              <div
                                key={row}
                                className="grid gap-1 sm:grid-cols-[1fr_10rem] sm:items-center"
                              >
                                <span className="text-sm">{row}</span>
                                <select
                                  className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                                  value={rowVal}
                                  onChange={(e) =>
                                    setAnamneseData((d) => ({
                                      ...d,
                                      [key]: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="">—</option>
                                  {(field.options ?? []).map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      ) : field.type === "check" && field.options ? (
                        <div className="flex flex-wrap gap-3">
                          {field.options.map((opt) => {
                            const selected = String(
                              anamneseData[field.id] ?? "",
                            )
                              .split("|")
                              .filter(Boolean);
                            const checked = selected.includes(opt);
                            return (
                              <label
                                key={opt}
                                className="flex items-center gap-1.5 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...selected, opt]
                                      : selected.filter((s) => s !== opt);
                                    setAnamneseData((d) => ({
                                      ...d,
                                      [field.id]: next.join("|"),
                                    }));
                                  }}
                                />
                                {opt}
                              </label>
                            );
                          })}
                        </div>
                      ) : field.type === "radio" && field.options ? (
                        <div className="flex flex-wrap gap-3">
                          {field.options.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-1.5 text-sm"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                checked={value === opt}
                                onChange={() =>
                                  setAnamneseData((d) => ({
                                    ...d,
                                    [field.id]: opt,
                                  }))
                                }
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <Input
                          placeholder={field.placeholder}
                          value={value}
                          onChange={(e) =>
                            setAnamneseData((d) => ({
                              ...d,
                              [field.id]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="no-print flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runPrint("anamnese")}
            >
              <Printer className="size-4" />
              Imprimir anamnese
            </Button>
            <Button disabled={pending} onClick={saveAnamnese}>
              Salvar anamnese
            </Button>
          </div>
        </section>
      )}

      {tab === "evolucoes" && (
        <section className="space-y-3">
          <div className="no-print flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setEditingSession(null);
                setSessionOpen(true);
              }}
            >
              <Plus className="size-4" />
              Nova evolução
            </Button>
          </div>
          {detail.sessionNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma evolução registrada.
            </p>
          ) : (
            <ul className="space-y-2">
              {detail.sessionNotes.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setViewSession(s)}
                    className="w-full rounded-md border border-border bg-card px-3 py-3 text-left hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium capitalize">{s.status}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatDateBR(s.date)}
                      </span>
                    </div>
                    {s.atividades && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {s.atividades}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Assign dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Atribuir a {detail.patient.name}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Buscar…"
            value={assignSearch}
            onChange={(e) => setAssignSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs",
                !assignCat && "border-primary bg-primary/10",
              )}
              onClick={() => setAssignCat(null)}
            >
              Todas
            </button>
            {EXERCISE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs",
                  assignCat === c.id && "border-primary bg-primary/10",
                )}
                onClick={() => setAssignCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {assignList.map((ex) => {
              const already = assignedIds.has(ex.id);
              return (
                <li
                  key={ex.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-2 text-sm"
                >
                  <span className="truncate">{ex.title}</span>
                  <Button
                    size="sm"
                    variant={already ? "outline" : "default"}
                    disabled={already || pending}
                    onClick={() => assign(ex.id)}
                  >
                    {already ? "No plano" : "Atribuir"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>

      {evalOpen && (
        <EvaluationFormDialog
          key={editingEval?.id ?? "new-eval"}
          open={evalOpen}
          onOpenChange={setEvalOpen}
          patientId={detail.patient.id}
          initial={editingEval}
          pending={pending}
          onSave={(ev, isEdit) => {
            setDetail((d) => ({
              ...d,
              evaluations: isEdit
                ? d.evaluations.map((e) => (e.id === ev.id ? ev : e))
                : [ev, ...d.evaluations],
            }));
            setEvalOpen(false);
          }}
          startTransition={startTransition}
        />
      )}

      <EvaluationViewDialog
        evaluation={viewEval}
        allEvaluations={detail.evaluations}
        exercises={exercises}
        onClose={() => setViewEval(null)}
        onEdit={(ev) => {
          setViewEval(null);
          setEditingEval(ev);
          setEvalOpen(true);
        }}
        onDelete={(id) => {
          startTransition(async () => {
            const result = await deleteEvaluationAction({ id });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            setDetail((d) => ({
              ...d,
              evaluations: d.evaluations.filter((e) => e.id !== id),
            }));
            setViewEval(null);
            toast.success("Avaliação removida");
          });
        }}
        onPrint={(ev) => runPrint("evaluation", ev)}
        pending={pending}
      />

      {sessionOpen && (
        <SessionFormDialog
          key={editingSession?.id ?? "new-session"}
          open={sessionOpen}
          onOpenChange={setSessionOpen}
          patientId={detail.patient.id}
          initial={editingSession}
          pending={pending}
          startTransition={startTransition}
          onSave={(s, isEdit) => {
            setDetail((d) => ({
              ...d,
              sessionNotes: isEdit
                ? d.sessionNotes.map((x) => (x.id === s.id ? s : x))
                : [s, ...d.sessionNotes],
            }));
            setSessionOpen(false);
          }}
        />
      )}

      <SessionViewDialog
        note={viewSession}
        onClose={() => setViewSession(null)}
        onEdit={(s) => {
          setViewSession(null);
          setEditingSession(s);
          setSessionOpen(true);
        }}
        onDelete={(id) => {
          startTransition(async () => {
            const result = await deleteSessionAction({ id });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            setDetail((d) => ({
              ...d,
              sessionNotes: d.sessionNotes.filter((s) => s.id !== id),
            }));
            setViewSession(null);
            toast.success("Evolução removida");
          });
        }}
        pending={pending}
      />

      {editPatientOpen && (
        <Dialog open={editPatientOpen} onOpenChange={setEditPatientOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Editar paciente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Nome</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Observações</Label>
                <Textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditPatientOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                disabled={pending || !editName.trim()}
                onClick={savePatientEdit}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Print block */}
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
                    if (!val && field.type !== "rating-grid" && field.type !== "status-table")
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
                    if (field.type === "status-table" && Array.isArray(field.rows)) {
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
    </div>
  );
}

function EvaluationFormDialog({
  open,
  onOpenChange,
  patientId,
  initial,
  pending,
  onSave,
  startTransition,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patientId: string;
  initial: EvaluationDTO | null;
  pending: boolean;
  onSave: (ev: EvaluationDTO, isEdit: boolean) => void;
  startTransition: (fn: () => void) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [tipo, setTipo] = useState(initial?.tipo ?? "Inicial");
  const [date, setDate] = useState(initial?.date ?? today);
  const [diagnostico, setDiagnostico] = useState(initial?.diagnostico ?? "");
  const [encaminhadoPor, setEncaminhadoPor] = useState(
    initial?.encaminhadoPor ?? "",
  );
  const [queixa, setQueixa] = useState(initial?.queixa ?? "");
  const [historia, setHistoria] = useState(initial?.historia ?? "");
  const [contextoFamiliar, setContextoFamiliar] = useState(
    initial?.contextoFamiliar ?? "",
  );
  const [nivelPrevio, setNivelPrevio] = useState(initial?.nivelPrevio ?? "");
  const [medicacoes, setMedicacoes] = useState(initial?.medicacoes ?? "");
  const [precaucoes, setPrecaucoes] = useState(initial?.precaucoes ?? "");
  const [equipamentos, setEquipamentos] = useState(initial?.equipamentos ?? "");
  const [objetivos, setObjetivos] = useState(initial?.objetivos ?? "");
  const [condutas, setCondutas] = useState(initial?.condutas ?? "");
  const [frequencia, setFrequencia] = useState(initial?.frequencia ?? "");
  const [criteriosAlta, setCriteriosAlta] = useState(
    initial?.criteriosAlta ?? "",
  );
  const [domains, setDomains] = useState(
    initial?.domains ??
      EXERCISE_CATEGORIES.map((c) => ({
        categoryId: c.id,
        score: 2,
        note: "",
      })),
  );

  function submit() {
    startTransition(async () => {
      const payload = {
        patientId,
        tipo,
        date,
        queixa,
        historia,
        domains,
        objetivos,
        condutas,
        diagnostico,
        encaminhadoPor,
        contextoFamiliar,
        nivelPrevio,
        medicacoes,
        precaucoes,
        equipamentos,
        frequencia,
        criteriosAlta,
      };
      const result = initial
        ? await updateEvaluationAction({ id: initial.id, ...payload })
        : await createEvaluationAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "Avaliação atualizada" : "Avaliação registrada");
      onSave(result.data, !!initial);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar avaliação" : "Nova avaliação"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v ?? tipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inicial">Avaliação inicial</SelectItem>
                  <SelectItem value="Reavaliação">Reavaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Diagnóstico / CID</Label>
              <Input
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ex: G80 – Paralisia cerebral"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Encaminhado por</Label>
              <Input
                value={encaminhadoPor}
                onChange={(e) => setEncaminhadoPor(e.target.value)}
                placeholder="Médico, escola, família…"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Queixa principal / motivo</Label>
            <Textarea
              rows={2}
              value={queixa}
              onChange={(e) => setQueixa(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>História clínica / ocupacional</Label>
            <Textarea
              rows={3}
              value={historia}
              onChange={(e) => setHistoria(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Contexto familiar e social</Label>
            <Textarea
              rows={2}
              value={contextoFamiliar}
              onChange={(e) => setContextoFamiliar(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Nível de função prévio</Label>
            <Textarea
              rows={2}
              value={nivelPrevio}
              onChange={(e) => setNivelPrevio(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Medicações em uso</Label>
              <Input
                value={medicacoes}
                onChange={(e) => setMedicacoes(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Precauções / contraindicações</Label>
              <Input
                value={precaucoes}
                onChange={(e) => setPrecaucoes(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Exame por domínio — 0 = dependente · 4 = independente
            </p>
            <div className="space-y-2">
              {domains.map((d, i) => {
                const cat = categoryOf(d.categoryId);
                return (
                  <div
                    key={d.categoryId}
                    className="rounded-md border border-border p-2"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: cat.color }}
                        />
                        {cat.label}
                      </span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => {
                              const next = [...domains];
                              next[i] = { ...d, score: n };
                              setDomains(next);
                            }}
                            className={cn(
                              "size-7 rounded border text-xs font-medium",
                              d.score === n
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      placeholder="Observação (opcional)"
                      value={d.note}
                      onChange={(e) => {
                        const next = [...domains];
                        next[i] = { ...d, note: e.target.value };
                        setDomains(next);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Uso de equipamentos / órteses</Label>
            <Input
              value={equipamentos}
              onChange={(e) => setEquipamentos(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Objetivos terapêuticos</Label>
            <Textarea
              rows={3}
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Condutas / plano de intervenção</Label>
            <Textarea
              rows={3}
              value={condutas}
              onChange={(e) => setCondutas(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Frequência proposta</Label>
              <Input
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
                placeholder="Ex: 2x por semana, 50 min"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Critérios de alta</Label>
              <Input
                value={criteriosAlta}
                onChange={(e) => setCriteriosAlta(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending} onClick={submit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EvaluationViewDialog({
  evaluation,
  allEvaluations,
  exercises,
  onClose,
  onEdit,
  onDelete,
  onPrint,
  pending,
}: {
  evaluation: EvaluationDTO | null;
  allEvaluations: EvaluationDTO[];
  exercises: ExerciseDTO[];
  onClose: () => void;
  onEdit: (ev: EvaluationDTO) => void;
  onDelete: (id: string) => void;
  onPrint: (ev: EvaluationDTO) => void;
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
                      <span className="text-muted-foreground">
                        {d.score}/4
                      </span>
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
            <Button variant="outline" size="sm" onClick={() => onPrint(evaluation)}>
              <Printer className="size-4" />
              Imprimir
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

function SessionFormDialog({
  open,
  onOpenChange,
  patientId,
  initial,
  pending,
  startTransition,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patientId: string;
  initial: SessionNoteDTO | null;
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onSave: (s: SessionNoteDTO, isEdit: boolean) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial?.date ?? today);
  const [status, setStatus] = useState(initial?.status ?? "compareceu");
  const [atividades, setAtividades] = useState(initial?.atividades ?? "");
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");

  function submit() {
    startTransition(async () => {
      const payload = {
        patientId,
        date,
        status: status as "compareceu" | "faltou" | "cancelado",
        atividades,
        observacoes,
      };
      const result = initial
        ? await updateSessionAction({ id: initial.id, ...payload })
        : await createSessionAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "Evolução atualizada" : "Evolução registrada");
      onSave(result.data, !!initial);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar evolução" : "Nova evolução"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v as typeof status) ?? status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compareceu">Compareceu</SelectItem>
                  <SelectItem value="faltou">Faltou</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Atividades realizadas</Label>
            <Textarea
              rows={3}
              value={atividades}
              onChange={(e) => setAtividades(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações</Label>
            <Textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending} onClick={submit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SessionViewDialog({
  note,
  onClose,
  onEdit,
  onDelete,
  pending,
}: {
  note: SessionNoteDTO | null;
  onClose: () => void;
  onEdit: (s: SessionNoteDTO) => void;
  onDelete: (id: string) => void;
  pending: boolean;
}) {
  if (!note) return null;
  return (
    <Dialog open={!!note} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif capitalize">
            {note.status} — {formatDateBR(note.date)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Atividades:</strong>
          </p>
          <p className="whitespace-pre-line">{note.atividades || "—"}</p>
          <p>
            <strong>Observações:</strong>
          </p>
          <p className="whitespace-pre-line">{note.observacoes || "—"}</p>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => onDelete(note.id)}
          >
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={() => onEdit(note)}>Editar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
