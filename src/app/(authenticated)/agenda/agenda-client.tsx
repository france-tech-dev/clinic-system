"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { EntityCombobox } from "@/components/entity-combobox";
import {
  deleteAppointmentAction,
  setAppointmentStatusAction,
} from "@/features/schedule/schedule.actions";
import { filterAppointmentsByMemberId } from "@/features/schedule/_lib/filter-appointments-by-member";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashTransactionFormDialog } from "@/features/finance/components/cash-transaction-form-dialog";
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

const MEMBER_FILTER_ALL = "all";

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
}: {
  initialView: "lista" | "calendario";
  initialDate: string;
  viewDateIso: string;
  initialCalView: "day" | "week" | "month";
  initialDay: AppointmentDTO[];
  initialUpcoming: AppointmentDTO[];
  calendarEvents: CalendarEvent[];
  calendarAppointments: AppointmentDTO[];
  patients: PatientDTO[];
  members: ScheduleMemberDTO[];
  defaultMemberId: string;
  initialMemberFilter: string;
}) {
  const router = useRouter();
  const [activeView, setActiveView] = useState(initialView);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [dayAppointments, setDayAppointments] = useState(initialDay);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [memberFilter, setMemberFilter] = useState(initialMemberFilter);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDTO | null>(null);
  const [sessionAppointment, setSessionAppointment] =
    useState<AppointmentDTO | null>(null);
  const [pending, startTransition] = useTransition();
  const cashflow = useAgendaCashflow();

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => a.name.localeCompare(b.name)),
    [patients],
  );

  const filteredDayAppointments = useMemo(
    () => filterAppointmentsByMemberId(dayAppointments, memberFilter),
    [dayAppointments, memberFilter],
  );

  const filteredUpcoming = useMemo(
    () => filterAppointmentsByMemberId(upcoming, memberFilter),
    [upcoming, memberFilter],
  );

  const filteredCalendarEvents = useMemo(
    () => filterAppointmentsByMemberId(calendarEvents, memberFilter),
    [calendarEvents, memberFilter],
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
    member?: string,
    calView?: "day" | "week" | "month",
  ) {
    const params = new URLSearchParams();
    params.set("view", view);
    params.set("date", date);
    if (view === "calendario") {
      params.set("viewDate", viewDate ?? date);
      params.set("calView", calView ?? initialCalView);
    }
    const memberValue = member ?? memberFilter;
    if (memberValue && memberValue !== MEMBER_FILTER_ALL) {
      params.set("member", memberValue);
    }
    return `${paths.agenda}?${params.toString()}`;
  }

  function navigate(date: string) {
    setSelectedDate(date);
    router.push(buildUrl(activeView, date, viewDateIso));
  }

  function switchView(view: "lista" | "calendario") {
    setActiveView(view);
    router.push(buildUrl(view, selectedDate, viewDateIso));
  }

  function changeMemberFilter(next: string) {
    const value = next || MEMBER_FILTER_ALL;
    setMemberFilter(value);
    router.push(buildUrl(activeView, selectedDate, viewDateIso, value));
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mt-1 text-sm text-muted-foreground">
            Sessões agendadas da clínica
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {members.length > 0 ? (
            <EntityCombobox
              options={members}
              value={memberFilter}
              onValueChange={changeMemberFilter}
              placeholder="Profissional"
              emptyText="Nenhum profissional encontrado"
              extraOption={{
                id: MEMBER_FILTER_ALL,
                name: "Todos os profissionais",
              }}
              className="w-50"
              aria-label="Filtrar por profissional"
            />
          ) : null}
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Novo agendamento
          </Button>
        </div>
      </div>

      <Tabs
        value={activeView}
        onValueChange={(v) => switchView(v as "lista" | "calendario")}
      >
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4 space-y-6">
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

          <section className="rounded-md border border-border bg-card p-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {relativeDayLabel(selectedDate)}
            </p>
            {filteredDayAppointments.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Nenhum agendamento para este dia
                {memberFilter !== MEMBER_FILTER_ALL
                  ? " com este profissional"
                  : ""}
                .
              </p>
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

          <section className="rounded-md border border-border bg-card p-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Próximos agendamentos
            </p>
            {upcomingGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum agendamento futuro
                {memberFilter !== MEMBER_FILTER_ALL
                  ? " com este profissional"
                  : " registrado"}
                .
              </p>
            ) : (
              upcomingGroups.map((g) => (
                <div key={g.date} className="mb-3">
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
          </section>
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <AgendaCalendar
            events={filteredCalendarEvents}
            viewDate={new Date(`${viewDateIso}T12:00:00`)}
            initialCalView={initialCalView}
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
                    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
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
                    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
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
  );
}
