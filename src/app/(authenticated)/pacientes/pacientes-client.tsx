"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  createPatientAction,
  setPatientStatusAction,
} from "@/features/patient/patient.actions";
import type {
  PatientDTO,
  PatientStatus,
} from "@/features/patient/patient.types";
import { paths } from "@/shared/constants/paths";
import { formatPatientListMeta } from "@/features/patient/_lib/patient-list-meta";
import { cn } from "@/shared/lib/utils";
import { CreatePatientDialog } from "./_components/create-patient-dialog";
import {
  parsePatientPriceInput,
} from "./[id]/_components/edit-patient-dialog";
import type { PatientPricingType } from "@/features/patient/patient.types";

const STATUS_LABEL: Record<PatientStatus, string> = {
  ativo: "Ativo",
  alta: "Alta",
  pausado: "Pausado",
};

export function PacientesClient({
  initialPatients,
}: {
  initialPatients: PatientDTO[];
}) {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | null>(null);
  const [open, setOpen] = useState(() => searchParams.get("novo") === "1");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [pricingType, setPricingType] = useState<PatientPricingType>("sessao");
  const [priceInput, setPriceInput] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchQ = !q || p.name.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [patients, search, statusFilter]);

  function create() {
    const priceCents = parsePatientPriceInput(priceInput);
    if (priceInput.trim() && priceCents === null) {
      toast.error("Valor inválido. Use o formato 0,00");
      return;
    }

    startTransition(async () => {
      const result = await createPatientAction({
        name,
        notes,
        pricingType,
        priceCents,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPatients((prev) =>
        [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.success("Paciente adicionado");
      setOpen(false);
      setName("");
      setNotes("");
      setPricingType("sessao");
      setPriceInput("");
    });
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
            ["ativo", "Ativos"],
            ["pausado", "Pausados"],
            ["alta", "Alta"],
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
                    p.status === "ativo" && "border-primary text-primary",
                    p.status === "alta" && "border-muted-foreground",
                    p.status === "pausado" &&
                      "border-fichario-patient text-fichario-patient",
                  )}
                >
                  {STATUS_LABEL[p.status]}
                </Badge>
                <select
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  value={p.status}
                  disabled={pending}
                  onChange={(e) =>
                    changeStatus(p.id, e.target.value as PatientStatus)
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreatePatientDialog
        open={open}
        onOpenChange={setOpen}
        name={name}
        onNameChange={setName}
        notes={notes}
        onNotesChange={setNotes}
        pricingType={pricingType}
        onPricingTypeChange={setPricingType}
        priceInput={priceInput}
        onPriceInputChange={setPriceInput}
        pending={pending}
        onSubmit={create}
      />
    </div>
  );
}
