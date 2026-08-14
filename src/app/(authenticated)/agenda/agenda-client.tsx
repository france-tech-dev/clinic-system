"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
} from "@/features/schedule/schedule.actions";
import {
  filterAppointmentsByMemberId,
  filterAppointmentsByPatientId,
} from "@/features/schedule/_lib/filter-appointments-by-member";
import type { CalendarEvent } from "@/features/schedule/_lib/appointment-calendar-utils";
import type {
  AppointmentDTO,
  ScheduleMemberDTO,
} from "@/features/schedule/schedule.types";
import type {
  PatientDTO,
  SessionLinkableAppointmentDTO,
} from "@/features/patient/patient.types";
import { SessionFormDialog } from "@/features/patient/components/session-form-dialog";
import {
  addDaysIso,
  relativeDayLabel,
  todayIso,
  type AppointmentStatusId,
} from "@/shared/constants/appointment";
import { paths } from "@/shared/constants/paths";
import { replacePathAndQuery } from "@/shared/lib/replace-path-and-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashTransactionFormDialog } from "@/features/finance/components/cash-transaction-form-dialog";
import { AgendaStatusLegend } from "./_components/agenda-status-legend";
import { AppointmentFormDialog } from "./_components/appointment-form-dialog";
import { AppointmentRow } from "./_components/appointment-row";
import { useAgendaCashflow } from "./_components/hooks/use-agenda-cashflow";
import { AgendaCalendar } from "./agenda-calendar";

function toLinkableAppointment(
  a: AppointmentDTO,
): SessionLinkableAppointmentDTO {
  return {
    id: a.id,
    date: a.date,
    time: a.time,
    status: a.status,
    professionalName: a.professionalName,
    sessionNoteId: a.hasSessionNote ? "existing" : null,
  };
}

function applyAgendaFilters<T extends { memberId: string; patientId: string }>(
  items: T[],
  memberIds: string[],
  patientIds: string[],
): T[] {
  return filterAppointmentsByPatientId(
    filterAppointmentsByMemberId(items, memberIds),
    patientIds,
  );
}

type CalView = "day" | "week" | "month";

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
  canSuggestCash: boolean;
}) {
  const router = useRouter();
  const [activeView, setActiveView] = useState(initialView);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarViewDateIso, setCalendarViewDateIso] = useState(viewDateIso);
  const [calView, setCalView] = useState<CalView>(initialCalView);
  const [dayAppointments, setDayAppointments] = useState(initialDay);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [memberFilter, setMemberFilter] = useState(initialMemberFilter);
  const [patientFilter, setPatientFilter] = useState(initialPatientFilter);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
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

  const hasActiveFilters = memberFilter.length > 0 || patientFilter.length > 0;
  const isOnlyMeFilter =
    defaultMemberId.length > 0 &&
    memberFilter.length === 1 &&
    memberFilter[0] === defaultMemberId &&
    patientFilter.length === 0;

  const filteredDayAppointments = useMemo(
    () => applyAgendaFilters(dayAppointments, memberFilter, patientFilter),
    [dayAppointments, memberFilter, patientFilter],
  );

  const filteredUpcoming = useMemo(
    () => applyAgendaFilters(upcoming, memberFilter, patientFilter),
    [upcoming, memberFilter, patientFilter],
  );

  const filteredCalendarEvents = useMemo(
    () => applyAgendaFilters(calendarEvents, memberFilter, patientFilter),
    [calendarEvents, memberFilter, patientFilter],
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

  function buildUrl(
    view: "lista" | "calendario",
    date: string,
    viewDate?: string,
    memberIds?: string[],
    patientIds?: string[],
    nextCalView?: CalView,
  ) {
    const params = new URLSearchParams();
    params.set("view", view);
    params.set("date", date);
    if (view === "calendario") {
      params.set("viewDate", viewDate ?? date);
      params.set("calView", nextCalView ?? calView);
    }
    const nextMembers = memberIds ?? memberFilter;
    if (nextMembers.length > 0) {
      params.set("member", nextMembers.join(","));
    }
    const nextPatients = patientIds ?? patientFilter;
    if (nextPatients.length > 0) {
      params.set("patient", nextPatients.join(","));
    }
    return `${paths.agenda}?${params.toString()}`;
  }

  /** UI-only: URL partilhável sem refetch RSC. */
  function syncUrl(
    view: "lista" | "calendario",
    date: string,
    viewDate?: string,
    memberIds?: string[],
    patientIds?: string[],
    nextCalView?: CalView,
  ) {
    replacePathAndQuery(
      buildUrl(view, date, viewDate, memberIds, patientIds, nextCalView),
    );
  }

  function navigate(date: string) {
    setSelectedDate(date);
    router.push(buildUrl(activeView, date, calendarViewDateIso));
  }

  function switchView(view: "lista" | "calendario") {
    setActiveView(view);
    syncUrl(view, selectedDate, calendarViewDateIso);
  }

  function changeMemberFilter(next: string[]) {
    setMemberFilter(next);
    syncUrl(activeView, selectedDate, calendarViewDateIso, next, patientFilter);
  }

  function changePatientFilter(next: string[]) {
    setPatientFilter(next);
    syncUrl(activeView, selectedDate, calendarViewDateIso, memberFilter, next);
  }

  function clearFilters() {
    setMemberFilter([]);
    setPatientFilter([]);
    syncUrl(activeView, selectedDate, calendarViewDateIso, [], []);
  }

  function filterOnlyMe() {
    if (!defaultMemberId) return;
    setMemberFilter([defaultMemberId]);
    setPatientFilter([]);
    syncUrl(
      activeView,
      selectedDate,
      calendarViewDateIso,
      [defaultMemberId],
      [],
    );
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

  function markHasSessionNote(appointmentId: string) {
    const patch = (list: AppointmentDTO[]) =>
      list.map((item) =>
        item.id === appointmentId ? { ...item, hasSessionNote: true } : item,
      );
    setDayAppointments(patch);
    setUpcoming(patch);
  }

  function changeStatus(id: string, status: AppointmentStatusId) {
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

  return (
    <AppPage
      title="Agenda"
      rightContent={
        <Button size="sm" onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Novo agendamento
        </Button>
      }
    >
      <div className="flex min-h-full flex-1 flex-col gap-6">
        <div className="flex shrink-0 flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Turno clínico do dia — marque sessões, atualize status e registe
            evoluções.
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
            {defaultMemberId ? (
              <Button
                type="button"
                size="sm"
                variant={isOnlyMeFilter ? "secondary" : "outline"}
                className="w-full sm:w-auto"
                onClick={isOnlyMeFilter ? clearFilters : filterOnlyMe}
              >
                <UserRound data-icon="inline-start" />
                {isOnlyMeFilter ? "Ver toda a clínica" : "Só eu"}
              </Button>
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

        <Tabs
          value={activeView}
          onValueChange={(v) => switchView(v as "lista" | "calendario")}
          className="flex min-h-0 flex-1 flex-col"
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
                      {hasActiveFilters
                        ? " com estes filtros"
                        : " registrado"}
                      .
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
            className="mt-4 flex min-h-0 flex-1 flex-col gap-3"
          >
            <AgendaStatusLegend />
            <AgendaCalendar
              events={filteredCalendarEvents}
              viewDateIso={calendarViewDateIso}
              loadedViewDateIso={viewDateIso}
              calView={calView}
              onCalViewChange={(next) => {
                setCalView(next);
                syncUrl(
                  "calendario",
                  selectedDate,
                  calendarViewDateIso,
                  undefined,
                  undefined,
                  next,
                );
              }}
              onViewDateChange={(nextIso, needsServerFetch) => {
                setCalendarViewDateIso(nextIso);
                if (needsServerFetch) {
                  router.push(buildUrl("calendario", selectedDate, nextIso));
                } else {
                  syncUrl("calendario", selectedDate, nextIso);
                }
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
              editing && !editing.hasSessionNote
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
          <SessionFormDialog
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
              markHasSessionNote(sessionAppointment.id);
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
            defaultType="income"
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
