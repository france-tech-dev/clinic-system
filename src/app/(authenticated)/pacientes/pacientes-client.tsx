"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityCombobox } from "@/components/entity-combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createGuardianAction } from "@/domains/guardian/guardian.actions";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import {
  EMPTY_GUARDIAN_DRAFT,
  guardianDraftToCreateInput,
} from "@/domains/guardian/_lib/guardian-form-defaults";
import {
  guardianDraftSchema,
  type GuardianDraftInput,
} from "@/domains/guardian/guardian.schema";
import {
  createPatientAction,
  setPatientMembersAction,
  setPatientStatusAction,
} from "@/domains/patient/patient.actions";
import {
  patientDraftSchema,
  type PatientDraftInput,
} from "@/domains/patient/patient.schema";
import type {
  PatientDTO,
  PatientStatus,
} from "@/domains/patient/patient.types";
import { EMPTY_PATIENT_DRAFT } from "@/domains/patient/_lib/patient-form-defaults";
import { formatPatientListMeta } from "@/domains/patient/_lib/patient-list-meta";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import { parseBrl } from "@/shared/lib/money-utils";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { cn } from "@/shared/lib/utils";
import { AssignPatientMembersDialog } from "@/features/patient/components/assign-patient-members-dialog";
import { CreatePatientDialog } from "./_components/create-patient-dialog";
import { PatientProfessionalsIndicator } from "@/features/patient/components/patient-professionals-indicator";
import {
  PATIENT_STATUS_LABEL,
  PATIENT_STATUS_OPTIONS,
} from "@/shared/constants/patient-status";
import {
  MemberStatus,
  PatientStatus as PatientStatusEnum,
} from "@prisma/enums";

type PendingStatusChange = {
  patient: PatientDTO;
  nextStatus: PatientStatus;
};

function formatUpdatedAt(iso: string) {
  const day = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? formatDateBR(day) : "—";
}

export function PacientesClient({
  initialPatients,
  initialGuardians,
  initialMembers,
  isLeadership,
}: {
  initialPatients: PatientDTO[];
  initialGuardians: GuardianDTO[];
  initialMembers: TeamMemberDTO[];
  isLeadership: boolean;
}) {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState(initialPatients);
  const [guardians, setGuardians] = useState(initialGuardians);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | null>(null);
  const [memberFilter, setMemberFilter] = useState<string | null>(null);
  const [open, setOpen] = useState(() => searchParams.get("novo") === "1");
  const [guardianMode, setGuardianMode] = useState<"new" | "existing">("new");
  const [selectedGuardianId, setSelectedGuardianId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [createPending, startCreateTransition] = useTransition();
  const [, startStatusTransition] = useTransition();
  const [membersPending, startMembersTransition] = useTransition();
  const [statusConfirm, setStatusConfirm] =
    useState<PendingStatusChange | null>(null);
  const [assignPatient, setAssignPatient] = useState<PatientDTO | null>(null);

  const patientForm = useForm<PatientDraftInput>({
    resolver: zodResolver(patientDraftSchema) as Resolver<PatientDraftInput>,
    defaultValues: EMPTY_PATIENT_DRAFT,
  });

  const guardianForm = useForm<GuardianDraftInput>({
    resolver: zodResolver(guardianDraftSchema),
    defaultValues: EMPTY_GUARDIAN_DRAFT,
  });

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter || memberFilter,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchMember =
        !memberFilter || p.members.some((m) => m.id === memberFilter);
      const matchQ = !q || p.name.toLowerCase().includes(q);
      return matchStatus && matchMember && matchQ;
    });
  }, [patients, search, statusFilter, memberFilter]);

  function resetForm() {
    patientForm.reset(EMPTY_PATIENT_DRAFT);
    setGuardianMode("new");
    setSelectedGuardianId("");
    setSelectedMemberIds([]);
    guardianForm.reset(EMPTY_GUARDIAN_DRAFT);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter(null);
    setMemberFilter(null);
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

      startCreateTransition(async () => {
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
            toast.error(guardianResult.message);
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
          price: parseBrl(patientDraft.priceInput),
          guardianId,
          memberIds: isLeadership ? selectedMemberIds : [],
        });
        if (!result.success) {
          applyActionFieldErrors(patientForm.setError, result.fieldErrors);
          toast.error(result.message);
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

  function requestStatusChange(patient: PatientDTO, nextStatus: PatientStatus) {
    if (!isLeadership || patient.status === nextStatus) return;
    if (
      nextStatus === PatientStatusEnum.DISCHARGED ||
      nextStatus === PatientStatusEnum.PAUSED
    ) {
      setStatusConfirm({ patient, nextStatus });
      return;
    }
    applyStatusChange(patient.id, nextStatus);
  }

  function applyStatusChange(id: string, status: PatientStatus) {
    setPendingId(id);
    startStatusTransition(async () => {
      const result = await setPatientStatusAction({ id, status });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setPatients((prev) => prev.map((p) => (p.id === id ? result.data : p)));
      toast.success("Status atualizado");
    });
  }

  function confirmStatusChange() {
    if (!statusConfirm) return;
    const { patient, nextStatus } = statusConfirm;
    setStatusConfirm(null);
    applyStatusChange(patient.id, nextStatus);
  }

  function saveMembers(memberIds: string[]) {
    if (!assignPatient) return;
    const patientId = assignPatient.id;
    setPendingId(patientId);
    startMembersTransition(async () => {
      const result = await setPatientMembersAction({ patientId, memberIds });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? result.data : p)),
      );
      setAssignPatient(null);
      toast.success("Profissionais atualizados");
    });
  }

  const listCountLabel = hasActiveFilters
    ? `${filtered.length} de ${patients.length} na lista`
    : `${patients.length} na lista`;

  const statusBadge = (status: PatientStatus) => (
    <Badge
      variant="outline"
      className={cn(
        status === PatientStatusEnum.ACTIVE && "border-primary text-primary",
        status === PatientStatusEnum.DISCHARGED && "border-muted-foreground",
        status === PatientStatusEnum.PAUSED &&
          "border-fichario-patient text-fichario-patient",
      )}
    >
      {PATIENT_STATUS_LABEL[status]}
    </Badge>
  );

  const rowActions = (p: PatientDTO, busy: boolean) =>
    isLeadership ? (
      <div className="flex items-center justify-end gap-1">
        {busy ? <Spinner className="size-3.5" /> : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              aria-label={`Alterar status de ${p.name}`}
            >
              Status
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PATIENT_STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === p.status}
                onClick={() => requestStatusChange(p, status)}
              >
                {PATIENT_STATUS_LABEL[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ) : busy ? (
      <Spinner className="size-3.5" />
    ) : null;

  const mobileStatusControl = (p: PatientDTO, busy: boolean) =>
    isLeadership ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            aria-label={`Alterar status de ${p.name}`}
          >
            {PATIENT_STATUS_LABEL[p.status]}
            <ChevronDown data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {PATIENT_STATUS_OPTIONS.map((status) => (
            <DropdownMenuItem
              key={status}
              disabled={status === p.status}
              onClick={() => requestStatusChange(p, status)}
            >
              {PATIENT_STATUS_LABEL[status]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      statusBadge(p.status)
    );

  function professionalsCell(patient: PatientDTO, busy: boolean) {
    return (
      <PatientProfessionalsIndicator
        patientName={patient.name}
        professionals={patient.members}
        canEdit={isLeadership}
        disabled={busy}
        onEdit={() => setAssignPatient(patient)}
      />
    );
  }

  return (
    <AppPage
      title="Pacientes"
      rightContent={
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus data-icon="inline-start" />
          Novo paciente
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              Cadastro de pacientes da clínica — busca, filtra e gere o ciclo
              Ativo / Pausado / Alta.
            </p>
            <p className="text-sm text-muted-foreground">{listCountLabel}</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:max-w-xs sm:flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar paciente por nome"
              />
            </div>

            <Select
              value={statusFilter ?? "all"}
              onValueChange={(value) =>
                setStatusFilter(
                  value == null || value === "all"
                    ? null
                    : (value as PatientStatus),
                )
              }
            >
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label="Filtrar por status"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value={PatientStatusEnum.ACTIVE}>Ativos</SelectItem>
                <SelectItem value={PatientStatusEnum.PAUSED}>
                  Pausados
                </SelectItem>
                <SelectItem value={PatientStatusEnum.DISCHARGED}>
                  Alta
                </SelectItem>
              </SelectContent>
            </Select>

            {initialMembers.length > 0 ? (
              <EntityCombobox
                options={initialMembers
                  .filter((m) => m.status === MemberStatus.ACTIVE)
                  .map((m) => ({ id: m.id, name: m.name }))}
                value={memberFilter ?? "__all__"}
                onValueChange={(id) =>
                  setMemberFilter(id === "__all__" || !id ? null : id)
                }
                extraOption={{ id: "__all__", name: "Todos os profissionais" }}
                placeholder="Profissional"
                searchPlaceholder="Pesquisar profissional…"
                emptyText="Nenhum profissional encontrado"
                className="w-full sm:w-56"
                aria-label="Filtrar por profissional"
              />
            ) : null}

            {hasActiveFilters ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={clearFilters}
              >
                <X data-icon="inline-start" />
                Limpar filtros
              </Button>
            ) : null}
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="space-y-3 rounded-md border border-border bg-card px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não há pacientes cadastrados nesta clínica.
            </p>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus data-icon="inline-start" />
              Cadastrar primeiro paciente
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="space-y-3 rounded-md border border-border bg-card px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum paciente corresponde à busca ou ao filtro.
            </p>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden rounded-md border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-30">
                      <span className="sr-only">Profissionais</span>
                      Profissionais
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Aval. / Evol.</TableHead>
                    <TableHead>Última aval.</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((patient) => {
                    const busy = pendingId === patient.id;
                    return (
                      <TableRow
                        key={patient.id}
                        className={cn(busy && "opacity-70")}
                        aria-busy={busy}
                      >
                        <TableCell>
                          <Link
                            href={paths.paciente(patient.id)}
                            className="font-medium hover:underline"
                          >
                            {patient.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {professionalsCell(patient, busy)}
                        </TableCell>
                        <TableCell>{statusBadge(patient.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {patient.guardian?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {patient.clinicalEvaluationsCount ?? 0} /{" "}
                          {patient.sessionsCount ?? 0}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {patient.lastClinicalEvaluationDate
                            ? formatDateBR(patient.lastClinicalEvaluationDate)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatUpdatedAt(patient.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {rowActions(patient, busy)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <ItemGroup data-size="sm" className="md:hidden">
              {filtered.map((p) => {
                const busy = pendingId === p.id;
                return (
                  <Item
                    key={p.id}
                    variant="outline"
                    role="listitem"
                    className={cn(
                      "flex-col items-stretch bg-card",
                      busy && "opacity-70",
                    )}
                    aria-busy={busy}
                  >
                    <ItemHeader>
                      <ItemContent className="min-w-0">
                        <Link
                          href={paths.paciente(p.id)}
                          className="min-w-0 hover:underline"
                        >
                          <ItemTitle>{p.name}</ItemTitle>
                          <ItemDescription>
                            {formatPatientListMeta(p)}
                          </ItemDescription>
                        </Link>
                      </ItemContent>
                      {busy ? <Spinner className="size-3.5" /> : null}
                    </ItemHeader>
                    <ItemFooter className="border-t border-border pt-2">
                      <div className="flex w-full items-center justify-between gap-2">
                        {professionalsCell(p, busy)}
                        {mobileStatusControl(p, busy)}
                      </div>
                    </ItemFooter>
                  </Item>
                );
              })}
            </ItemGroup>
          </>
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
          members={initialMembers}
          selectedMemberIds={selectedMemberIds}
          onSelectedMemberIdsChange={setSelectedMemberIds}
          canAssignMembers={isLeadership}
          pending={createPending}
          onSubmit={create}
        />

        {assignPatient ? (
          <AssignPatientMembersDialog
            open
            onOpenChange={(next) => {
              if (!next) setAssignPatient(null);
            }}
            patientName={assignPatient.name}
            members={initialMembers}
            initialMemberIds={assignPatient.members.map((m) => m.id)}
            pending={membersPending}
            onSave={saveMembers}
          />
        ) : null}

        <AlertDialog
          open={statusConfirm != null}
          onOpenChange={(next) => {
            if (!next) setStatusConfirm(null);
          }}
        >
          <AlertDialogContent size="default">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {statusConfirm?.nextStatus === PatientStatusEnum.DISCHARGED
                  ? "Marcar alta?"
                  : "Pausar paciente?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {statusConfirm?.nextStatus === PatientStatusEnum.DISCHARGED
                  ? `«${statusConfirm.patient.name}» passa a Alta. Pode reativar depois se precisar.`
                  : `«${statusConfirm?.patient.name}» fica Pausado até voltar a Ativo.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStatusChange}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppPage>
  );
}
