"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { createGuardianAction } from "@/features/guardian/guardian.actions";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import {
  EMPTY_GUARDIAN_DRAFT,
  guardianDraftToCreateInput,
} from "@/features/guardian/_lib/guardian-form-defaults";
import {
  guardianDraftSchema,
  type GuardianDraftInput,
} from "@/features/guardian/guardian.schema";
import {
  createPatientAction,
  setPatientStatusAction,
} from "@/features/patient/patient.actions";
import {
  patientDraftSchema,
  type PatientDraftInput,
} from "@/features/patient/patient.schema";
import type {
  PatientDTO,
  PatientStatus,
} from "@/features/patient/patient.types";
import { EMPTY_PATIENT_DRAFT } from "@/features/patient/_lib/patient-form-defaults";
import { parsePatientPriceInput } from "@/features/patient/_lib/patient-price-input";
import { paths } from "@/shared/constants/paths";
import { formatPatientListMeta } from "@/features/patient/_lib/patient-list-meta";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { cn } from "@/shared/lib/utils";
import { CreatePatientDialog } from "./_components/create-patient-dialog";

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Ativo",
  discharged: "Alta",
  paused: "Pausado",
};

export function PacientesClient({
  initialPatients,
  initialGuardians,
}: {
  initialPatients: PatientDTO[];
  initialGuardians: GuardianDTO[];
}) {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState(initialPatients);
  const [guardians, setGuardians] = useState(initialGuardians);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | null>(null);
  const [open, setOpen] = useState(() => searchParams.get("novo") === "1");
  const [guardianMode, setGuardianMode] = useState<"new" | "existing">("new");
  const [selectedGuardianId, setSelectedGuardianId] = useState("");
  const [pending, startTransition] = useTransition();

  const patientForm = useForm<PatientDraftInput>({
    resolver: zodResolver(patientDraftSchema) as Resolver<PatientDraftInput>,
    defaultValues: EMPTY_PATIENT_DRAFT,
  });

  const guardianForm = useForm<GuardianDraftInput>({
    resolver: zodResolver(guardianDraftSchema),
    defaultValues: EMPTY_GUARDIAN_DRAFT,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchQ = !q || p.name.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [patients, search, statusFilter]);

  function resetForm() {
    patientForm.reset(EMPTY_PATIENT_DRAFT);
    setGuardianMode("new");
    setSelectedGuardianId("");
    guardianForm.reset(EMPTY_GUARDIAN_DRAFT);
  }

  function create() {
    void (async () => {
      const patientOk = await patientForm.trigger();
      if (guardianMode === "existing" && !selectedGuardianId) {
        toast.error("Selecione o responsável");
        return;
      }
      const guardianOk =
        guardianMode === "new" ? await guardianForm.trigger() : true;
      if (!patientOk || !guardianOk) return;

      const patientDraft = patientForm.getValues();
      const guardianDraft =
        guardianMode === "new" ? guardianForm.getValues() : undefined;

      startTransition(async () => {
        let guardianId = selectedGuardianId;

        if (guardianMode === "new" && guardianDraft) {
          const guardianResult = await createGuardianAction(
            guardianDraftToCreateInput(guardianDraft),
          );
          if (!guardianResult.success) {
            applyActionFieldErrors(
              guardianForm.setError,
              guardianResult.fieldErrors,
            );
            toast.error(guardianResult.error);
            return;
          }
          guardianId = guardianResult.data.id;
          setGuardians((prev) =>
            [...prev, guardianResult.data].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
          );
          if (guardianResult.data.mustChangePassword) {
            toast.message(
              "Acesso ao portal criado. O responsável deve alterar a senha no primeiro login.",
            );
          }
        }

        const result = await createPatientAction({
          name: patientDraft.name,
          birthDate: patientDraft.birthDate || null,
          sex: patientDraft.sex,
          notes: patientDraft.notes,
          pricingType: patientDraft.pricingType,
          priceCents: parsePatientPriceInput(patientDraft.priceInput),
          guardianId,
        });
        if (!result.success) {
          applyActionFieldErrors(patientForm.setError, result.fieldErrors);
          toast.error(result.error);
          return;
        }
        setPatients((prev) =>
          [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast.success("Paciente adicionado");
        setOpen(false);
        resetForm();
      });
    })();
  }

  function changeStatus(id: string, status: PatientStatus) {
    startTransition(async () => {
      const result = await setPatientStatusAction({ id, status });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPatients((prev) => prev.map((p) => (p.id === id ? result.data : p)));
      toast.success("Status atualizado");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} na lista
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Novo paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar paciente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            [null, "Todos"],
            ["active", "Ativos"],
            ["paused", "Pausados"],
            ["discharged", "Alta"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              statusFilter === value
                ? "border-primary bg-primary/10 text-foreground"
                : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum paciente encontrado. Adicione o primeiro paciente.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <Link
                href={paths.paciente(p.id)}
                className="min-w-0 flex-1 hover:underline"
              >
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPatientListMeta(p)}
                </p>
              </Link>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    p.status === "active" && "border-primary text-primary",
                    p.status === "discharged" && "border-muted-foreground",
                    p.status === "paused" &&
                      "border-fichario-patient text-fichario-patient",
                  )}
                >
                  {STATUS_LABEL[p.status]}
                </Badge>
                <NativeSelect
                  size="sm"
                  className="text-xs"
                  value={p.status}
                  disabled={pending}
                  onChange={(e) =>
                    changeStatus(p.id, e.target.value as PatientStatus)
                  }
                >
                  <NativeSelectOption value="active">Ativo</NativeSelectOption>
                  <NativeSelectOption value="paused">
                    Pausado
                  </NativeSelectOption>
                  <NativeSelectOption value="discharged">Alta</NativeSelectOption>
                </NativeSelect>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreatePatientDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) resetForm();
          setOpen(next);
        }}
        patientForm={patientForm}
        guardianMode={guardianMode}
        onGuardianModeChange={setGuardianMode}
        selectedGuardianId={selectedGuardianId}
        onSelectedGuardianIdChange={setSelectedGuardianId}
        guardians={guardians}
        guardianForm={guardianForm}
        pending={pending}
        onSubmit={create}
      />
    </div>
  );
}
