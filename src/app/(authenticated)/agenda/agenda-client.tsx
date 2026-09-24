"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { EntityMultiCombobox } from "@/components/entity-multi-combobox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  deleteAppointmentAction,
  setAppointmentStatusAction,
} from "@/domains/schedule/schedule.actions";
import {
  filterAppointmentsByMemberId,
  filterAppointmentsByPatientId,
  filterAppointmentsByStatus,
} from "@/domains/schedule/_lib/filter-appointments-by-member";
import type { CalendarEvent } from "@/domains/schedule/_lib/appointment-calendar-utils";
import type {
  AppointmentDTO,
  ScheduleMemberDTO,
} from "@/domains/schedule/schedule.types";
import type { LinkableAppointmentDTO } from "@/domains/evolution/evolution.types";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { EvolutionFormDialog } from "@/features/evolution/components/evolution-form-dialog";
import {
  addDaysIso,
  APPOINTMENT_STATUSES,
  relativeDayLabel,
  todayIso,
} from "@/shared/constants/appointment";
import type { AppointmentStatus } from "@prisma/enums";
import { CashTransactionType } from "@prisma/enums";
import { cn } from "@/shared/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashTransactionFormDialog } from "@/features/finance/components/cash-transaction-form-dialog";
import { AgendaStatusLegend } from "./_components/agenda-status-legend";
import { AppointmentFormDialog } from "./_components/appointment-form-dialog";
import { AppointmentRow } from "./_components/appointment-row";
import { useAgendaCashflow } from "./_components/hooks/use-agenda-cashflow";
import { AgendaCalendar } from "./agenda-calendar";

function toLinkableAppointment(
  a: AppointmentDTO,
): LinkableAppointmentDTO {
  return {
    id: a.id,
    date: a.date,
    time: a.time,
    status: a.status,
    professionalName: a.professionalName,
    evolutionId: a.hasEvolution ? "existing" : null,
  };
}

function applyAgendaFilters<
  T extends { memberId: string; patientId: string; status: string },
>(
  items: T[],
  memberIds: string[],
  patientIds: string[],
  statuses: string[],
): T[] {
  return filterAppointmentsByStatus(
    filterAppointmentsByPatientId(
      filterAppointmentsByMemberId(items, memberIds),
      patientIds,
    ),
    statuses,
  );
}

const STATUS_FILTER_OPTIONS = APPOINTMENT_STATUSES.map((s) => ({
  id: s.id,
  name: s.label,
}));

const VIEW_VALUES = ["lista", "calendario"] as const;
const CAL_VIEW_VALUES = ["day", "week", "month"] as const;

type CalView = (typeof CAL_VIEW_VALUES)[number];

export function AgendaClient({
  initialView,
  initialDate,
  viewDateIso,
  initialCalView,
  initialDay,
  initialUpcoming,
  calendarEvents,
  calendarAppointments,
  patients,
  members,
  defaultMemberId,
  initialMemberFilter,
  initialPatientFilter,
  initialStatusFilter,
  canSuggestCash,
}: {
  initialView: "lista" | "calendario";
  initialDate: string;
  viewDateIso: string;
  initialCalView: CalView;
  initialDay: AppointmentDTO[];
  initialUpcoming: AppointmentDTO[];
  calendarEvents: CalendarEvent[];
  calendarAppointments: AppointmentDTO[];
  patients: PatientDTO[];
  members: ScheduleMemberDTO[];
  defaultMemberId: string;
  initialMemberFilter: string[];
  initialPatientFilter: string[];
  initialStatusFilter: string[];
  canSuggestCash: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useQueryStates(
    {
      view: parseAsStringLiteral(VIEW_VALUES).withDefault(initialView),
      date: parseAsString.withDefault(initialDate),
      viewDate: parseAsString.withDefault(viewDateIso),
      calView: parseAsStringLiteral(CAL_VIEW_VALUES).withDefault(initialCalView),
      member: parseAsArrayOf(parseAsString, ",").withDefault(
        initialMemberFilter,
      ),
      patient: parseAsArrayOf(parseAsString, ",").withDefault(
        initialPatientFilter,
      ),
      status: parseAsArrayOf(parseAsString, ",").withDefault(
        initialStatusFilter,
      ),
    },
    { history: "replace" },
  );

  const activeView = url.view;
  const selectedDate = url.date;
  const calendarViewDateIso = url.viewDate ?? url.date;
  const calView = url.calView;
  const memberFilter = url.member;
  const patientFilter = url.patient;
  const statusFilter = url.status;

  const [dayAppointments, setDayAppointments] = useState(initialDay);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDTO | null>(null);
  const [sessionAppointment, setSessionAppointment] =
    useState<AppointmentDTO | null>(null);
  const [pending, startTransition] = useTransition();
  const cashflow = useAgendaCashflow(canSuggestCash);

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => a.name.localeCompare(b.name)),
    [patients],
  );

  const hasActiveFilters =
    memberFilter.length > 0 ||
    patientFilter.length > 0 ||
    statusFilter.length > 0;
  const activeFilterCount =
    memberFilter.length + patientFilter.length + statusFilter.length;
  const isOnlyMeFilter =
    defaultMemberId.length > 0 &&
    memberFilter.length === 1 &&
    memberFilter[0] === defaultMemberId &&
    patientFilter.length === 0 &&
    statusFilter.length === 0;

  const filteredDayAppointments = useMemo(
    () =>
      applyAgendaFilters(
        dayAppointments,
        memberFilter,
        patientFilter,
        statusFilter,
      ),
    [dayAppointments, memberFilter, patientFilter, statusFilter],
  );

  const filteredUpcoming = useMemo(
    () =>
      applyAgendaFilters(upcoming, memberFilter, patientFilter, statusFilter),
    [upcoming, memberFilter, patientFilter, statusFilter],
  );

  const filteredCalendarEvents = useMemo(
    () =>
      applyAgendaFilters(
        calendarEvents,
        memberFilter,
        patientFilter,
        statusFilter,
      ),
    [calendarEvents, memberFilter, patientFilter, statusFilter],
  );

  const appointmentsById = useMemo(() => {
    const map = new Map<string, AppointmentDTO>();
    for (const a of [
      ...dayAppointments,
      ...upcoming,
      ...calendarAppointments,
    ]) {
      map.set(a.id, a);
    }
    return map;
  }, [dayAppointments, upcoming, calendarAppointments]);

  function navigate(date: string) {
    void setUrl({ date }, { shallow: false });
  }

  function switchView(view: "lista" | "calendario") {
    void setUrl(
      view === "calendario"
        ? { view, viewDate: selectedDate }
        : { view, viewDate: null },
    );
  }

  function changeMemberFilter(next: string[]) {
    void setUrl({ member: next });
  }

  function changePatientFilter(next: string[]) {
    void setUrl({ patient: next });
  }

  function changeStatusFilter(next: string[]) {
    void setUrl({ status: next });
  }

  function clearFilters() {
    void setUrl({ member: [], patient: [], status: [] });
  }

  function filterOnlyMe() {
    if (!defaultMemberId) return;
    void setUrl({
      member: [defaultMemberId],
      patient: [],
      status: [],
    });
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(a: AppointmentDTO) {
    setEditing(a);
    setFormOpen(true);
  }

  function openEditById(id: string) {
    const a = appointmentsById.get(id);
    if (a) openEdit(a);
  }

  function openEvolve(a: AppointmentDTO) {
    setFormOpen(false);
    setSessionAppointment(a);
  }

  function markHasEvolution(appointmentId: string) {
    const patch = (list: AppointmentDTO[]) =>
      list.map((item) =>
        item.id === appointmentId ? { ...item, hasEvolution: true } : item,
      );
    setDayAppointments(patch);
    setUpcoming(patch);
  }

  function changeStatus(id: string, status: AppointmentStatus) {
    startTransition(async () => {
      const result = await setAppointmentStatusAction({ id, status });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      const updated = result.data;
      setDayAppointments((prev) =>
        prev.map((a) => (a.id === id ? updated : a)),
      );
      setUpcoming((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success("Status atualizado");
      cashflow.onAppointmentStatusChanged(updated, status);
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteAppointmentAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setDayAppointments((prev) => prev.filter((a) => a.id !== id));
      setUpcoming((prev) => prev.filter((a) => a.id !== id));
      toast.success("Agendamento removido");
      setFormOpen(false);
    });
  }

  const upcomingGroups = useMemo(() => {
    const groups: { date: string; items: AppointmentDTO[] }[] = [];
    let last: string | null = null;
    for (const a of filteredUpcoming) {
      if (a.date !== last) {
        groups.push({ date: a.date, items: [] });
        last = a.date;
      }
      groups[groups.length - 1].items.push(a);
    }
    return groups;
  }, [filteredUpcoming]);

  const emptyDayMessage = hasActiveFilters
    ? "Nenhum agendamento para este dia com estes filtros."
    : "Nenhum agendamento para este dia.";

  const isCalendar = activeView === "calendario";

  return (
    <AppPage
      title="Agenda"
      fillViewport={isCalendar}
      contentClassName={
        isCalendar
          ? "flex min-h-0 flex-1 flex-col gap-3 px-4 pb-2 pt-3 md:gap-3 md:pb-3 md:pt-4 lg:px-6"
          : undefined
      }
      rightContent={
        <Button size="sm" onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Novo agendamento
        </Button>
      }
    >
      <div
        className={
          isCalendar
            ? "flex min-h-0 flex-1 flex-col gap-3"
            : "flex min-h-full flex-1 flex-col gap-4"
        }
      >
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="order-1 min-w-0 flex-1 sm:hidden"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <ListFilter data-icon="inline-start" />
            Filtros
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            <ChevronDown
              data-icon="inline-end"
              className={filtersOpen ? "rotate-180" : undefined}
            />
          </Button>

          <div
            className={cn(
              "order-3 w-full flex-col gap-2 sm:order-1 sm:flex sm:w-auto sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center",
              filtersOpen ? "flex" : "hidden",
            )}
          >
            <EntityMultiCombobox
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onValueChange={changeStatusFilter}
              placeholder="Status"
              emptyText="Nenhum status encontrado"
              className="w-full sm:w-44"
              aria-label="Filtrar por status"
            />
            <EntityMultiCombobox
              options={sortedPatients}
              value={patientFilter}
              onValueChange={changePatientFilter}
              placeholder="Pacientes"
              emptyText="Nenhum paciente encontrado"
              className="w-full sm:w-56"
              aria-label="Filtrar por paciente"
            />
            {members.length > 0 ? (
              <EntityMultiCombobox
                options={members}
                value={memberFilter}
                onValueChange={changeMemberFilter}
                placeholder="Profissionais"
                emptyText="Nenhum profissional encontrado"
                className="w-full sm:w-56"
                aria-label="Filtrar por profissional"
              />
            ) : null}
          </div>

          {defaultMemberId ? (
            <Button
              type="button"
              size="sm"
              variant={isOnlyMeFilter ? "secondary" : "outline"}
              className="order-1 shrink-0 sm:order-2"
              onClick={isOnlyMeFilter ? clearFilters : filterOnlyMe}
            >
              <UserRound data-icon="inline-start" />
              Só eu
            </Button>
          ) : null}
          {hasActiveFilters ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="order-2 shrink-0 sm:order-3"
              onClick={clearFilters}
            >
              <X data-icon="inline-start" />
              <span className="hidden sm:inline">Limpar filtros</span>
            </Button>
          ) : null}
        </div>

        <Tabs
          value={activeView}
          onValueChange={(v) => switchView(v as "lista" | "calendario")}
          className="flex min-h-0 flex-1 flex-col gap-2"
        >
          <TabsList className="shrink-0">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="mt-4 space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(addDaysIso(selectedDate, -1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(todayIso())}
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(addDaysIso(selectedDate, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <DatePicker
                  className="max-w-44"
                  value={selectedDate}
                  onChange={navigate}
                />
              </div>
              <AgendaStatusLegend />
            </div>

            <section className="rounded-md border border-border bg-card p-4">
              <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {relativeDayLabel(selectedDate)}
              </p>
              {filteredDayAppointments.length === 0 ? (
                <div className="space-y-3 py-4">
                  <p className="text-sm text-muted-foreground">
                    {emptyDayMessage}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hasActiveFilters ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={clearFilters}
                      >
                        Limpar filtros
                      </Button>
                    ) : null}
                    <Button type="button" size="sm" onClick={openCreate}>
                      <Plus data-icon="inline-start" />
                      Novo agendamento
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {filteredDayAppointments.map((a) => (
                    <AppointmentRow
                      key={a.id}
                      appointment={a}
                      pending={pending}
                      onEdit={openEdit}
                      onStatus={changeStatus}
                    />
                  ))}
                </ul>
              )}
            </section>

            <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
              <section className="rounded-md border border-border bg-card p-4">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="mb-0 flex w-full items-center justify-between gap-2 text-left"
                  >
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Próximos agendamentos
                      {filteredUpcoming.length > 0
                        ? ` (${filteredUpcoming.length})`
                        : ""}
                    </span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${upcomingOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  {upcomingGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum agendamento futuro
                      {hasActiveFilters ? " com estes filtros" : " registrado"}.
                      {hasActiveFilters ? (
                        <>
                          {" "}
                          <button
                            type="button"
                            className="underline underline-offset-2"
                            onClick={clearFilters}
                          >
                            Limpar filtros
                          </button>
                        </>
                      ) : null}
                    </p>
                  ) : (
                    upcomingGroups.map((g) => (
                      <div key={g.date} className="mb-3 last:mb-0">
                        <p className="mb-1.5 text-xs font-semibold capitalize">
                          {relativeDayLabel(g.date)}
                        </p>
                        <ul className="space-y-2">
                          {g.items.map((a) => (
                            <AppointmentRow
                              key={a.id}
                              appointment={a}
                              pending={pending}
                              onEdit={openEdit}
                              onStatus={changeStatus}
                            />
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </CollapsibleContent>
              </section>
            </Collapsible>
          </TabsContent>

          <TabsContent
            value="calendario"
            className="mt-0 flex min-h-0 flex-1 flex-col gap-2 outline-none"
          >
            <div className="hidden sm:block">
              <AgendaStatusLegend />
            </div>
            <AgendaCalendar
              events={filteredCalendarEvents}
              viewDateIso={calendarViewDateIso}
              loadedViewDateIso={viewDateIso}
              calView={calView}
              onCalViewChange={(next) => {
                void setUrl({ calView: next });
              }}
              onViewDateChange={(nextIso, needsServerFetch) => {
                void setUrl(
                  { viewDate: nextIso },
                  { shallow: !needsServerFetch },
                );
              }}
              onSelectEvent={openEditById}
            />
          </TabsContent>
        </Tabs>

        {formOpen && (
          <AppointmentFormDialog
            key={editing?.id ?? `new-${selectedDate}`}
            open={formOpen}
            onOpenChange={setFormOpen}
            patients={sortedPatients}
            members={members}
            defaultMemberId={defaultMemberId}
            initial={editing}
            defaultDate={selectedDate}
            pending={pending}
            startTransition={startTransition}
            onDelete={editing ? () => remove(editing.id) : undefined}
            onEvolve={
              editing && !editing.hasEvolution
                ? () => openEvolve(editing)
                : undefined
            }
            onSaved={(createdOrUpdated, isEdit, repeatCount) => {
              if (isEdit && !Array.isArray(createdOrUpdated)) {
                const updated = createdOrUpdated;
                setDayAppointments((prev) => {
                  if (updated.date === selectedDate) {
                    const exists = prev.some((a) => a.id === updated.id);
                    const next = exists
                      ? prev.map((a) => (a.id === updated.id ? updated : a))
                      : [...prev, updated];
                    return next.sort((a, b) =>
                      (a.time || "").localeCompare(b.time || ""),
                    );
                  }
                  return prev.filter((a) => a.id !== updated.id);
                });
                setUpcoming((prev) => {
                  const without = prev.filter((a) => a.id !== updated.id);
                  if (updated.date >= todayIso()) {
                    return [...without, updated].sort((a, b) =>
                      `${a.date} ${a.time}`.localeCompare(
                        `${b.date} ${b.time}`,
                      ),
                    );
                  }
                  return without;
                });
              } else if (Array.isArray(createdOrUpdated)) {
                const created = createdOrUpdated;
                setDayAppointments((prev) => {
                  const forDay = created.filter((a) => a.date === selectedDate);
                  if (forDay.length === 0) return prev;
                  return [...prev, ...forDay].sort((a, b) =>
                    (a.time || "").localeCompare(b.time || ""),
                  );
                });
                setUpcoming((prev) => {
                  const fromToday = created.filter((a) => a.date >= todayIso());
                  return [...prev, ...fromToday]
                    .sort((a, b) =>
                      `${a.date} ${a.time}`.localeCompare(
                        `${b.date} ${b.time}`,
                      ),
                    )
                    .slice(0, 20);
                });
                toast.success(
                  repeatCount && repeatCount > 1
                    ? `${repeatCount} agendamentos criados`
                    : "Agendamento criado",
                );
              }
              setFormOpen(false);
              router.refresh();
            }}
          />
        )}

        {sessionAppointment && (
          <EvolutionFormDialog
            key={`session-${sessionAppointment.id}`}
            open
            onOpenChange={(open) => {
              if (!open) setSessionAppointment(null);
            }}
            patientId={sessionAppointment.patientId}
            appointments={[toLinkableAppointment(sessionAppointment)]}
            initial={null}
            lockAppointment
            pending={pending}
            startTransition={startTransition}
            onSave={() => {
              markHasEvolution(sessionAppointment.id);
              setSessionAppointment(null);
              router.refresh();
            }}
          />
        )}

        {cashflow.cashDialogOpen && (
          <CashTransactionFormDialog
            key={`cash-${cashflow.cashDraft?.patientId ?? "new"}-${cashflow.cashDraft?.date ?? ""}`}
            open
            onOpenChange={(open) => {
              if (!open) cashflow.closeCashDialog();
            }}
            patients={sortedPatients}
            members={members}
            initial={null}
            draft={cashflow.cashDraft}
            defaultDate={todayIso()}
            defaultType={CashTransactionType.INCOME}
            lockType
            defaultMemberId={defaultMemberId}
            pending={pending}
            startTransition={startTransition}
            onSaved={() => {
              cashflow.closeCashDialog();
              router.refresh();
            }}
          />
        )}
      </div>
    </AppPage>
  );
}
