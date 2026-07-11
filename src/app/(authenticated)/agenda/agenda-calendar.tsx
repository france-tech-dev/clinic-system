"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type View,
} from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { format, getDay, set, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { rescheduleAppointmentAction } from "@/features/schedule/schedule.actions";
import {
  type CalendarEvent,
  calendarEventStyle,
  formatAppointmentDate,
  formatAppointmentTime,
} from "@/features/schedule/_lib/appointment-calendar-utils";
import { paths } from "@/shared/constants/paths";
import "./agenda-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 0, locale: ptBR }),
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

const CALENDAR_MESSAGES = {
  today: "Hoje",
  previous: "Anterior",
  next: "Próximo",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Nenhum agendamento neste período.",
  showMore: (total: number) => `+${total} mais`,
};

export function AgendaCalendar({
  events,
  viewDate,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  viewDate: Date;
  onSelectEvent?: (id: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>(Views.WEEK);
  const [isPending, startTransition] = useTransition();
  const [localEvents, setLocalEvents] = useState(events);
  const [prevEvents, setPrevEvents] = useState(events);

  if (events !== prevEvents) {
    setPrevEvents(events);
    setLocalEvents(events);
  }

  const onNavigate = useCallback(
    (newDate: Date) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("view", "calendario");
      next.set("viewDate", formatAppointmentDate(newDate));
      router.push(`${paths.agenda}?${next.toString()}`);
    },
    [router, searchParams],
  );

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const style = calendarEventStyle(event.status);
    return { style };
  }, []);

  const moveEvent = useCallback<
    NonNullable<withDragAndDropProps<CalendarEvent>["onEventDrop"]>
  >(
    ({ event, start }) => {
      const typed = event as CalendarEvent;
      const newStart = start instanceof Date ? start : new Date(start);
      const durationMs = typed.end.getTime() - typed.start.getTime();

      const previous = localEvents;
      setLocalEvents((prev) =>
        prev.map((e) =>
          e.id === typed.id
            ? {
                ...e,
                start: newStart,
                end: new Date(newStart.getTime() + durationMs),
              }
            : e,
        ),
      );

      startTransition(async () => {
        const result = await rescheduleAppointmentAction({
          id: typed.id,
          date: formatAppointmentDate(newStart),
          time: formatAppointmentTime(newStart),
        });
        if (!result.success) {
          setLocalEvents(previous);
          toast.error(result.error);
          return;
        }
        toast.success("Agendamento realocado");
        router.refresh();
      });
    },
    [localEvents, router],
  );

  return (
    <div className="agenda-calendar rounded-md border border-border bg-card p-3 lg:p-4">
      <p className="mb-3 text-sm text-muted-foreground">
        Arraste um agendamento para alterar horário ou dia. Clique para editar.
      </p>
      <DnDCalendar
        localizer={localizer}
        events={localEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        date={viewDate}
        onNavigate={onNavigate}
        view={view}
        onView={(v) => setView(v)}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        step={30}
        timeslots={2}
        min={set(new Date(), { hours: 7, minutes: 0, seconds: 0 })}
        max={set(new Date(), { hours: 21, minutes: 0, seconds: 0 })}
        scrollToTime={set(new Date(), { hours: 8, minutes: 0, seconds: 0 })}
        popup
        culture="pt-BR"
        style={{ height: "70dvh", minHeight: "420px" }}
        eventPropGetter={eventPropGetter}
        onEventDrop={moveEvent}
        draggableAccessor={(event) =>
          !isPending && (event as CalendarEvent).status === "agendado"
        }
        resizable={false}
        selectable={false}
        messages={CALENDAR_MESSAGES}
        onSelectEvent={(event) => onSelectEvent?.(event.id)}
      />
    </div>
  );
}
