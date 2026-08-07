"use client";

import { useCallback, useState, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type EventProps,
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
import { parseIsoDateParam } from "@/features/schedule/_lib/schedule-appointments-range";
import { useIsMobile } from "@/hooks/use-mobile";
import { paths } from "@/shared/constants/paths";
import "./agenda-calendar.css";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 0, locale: ptBR }),
  getDay,
  locales,
});

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

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

function isSameCalendarMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function CalendarEventLabel({ event }: EventProps<CalendarEvent>) {
  const canDrag = event.status === "scheduled";

  return (
    <div className="agenda-event-content">
      <div className="agenda-event-text min-w-0 flex-1 truncate">
        {event.professionalName ? (
          <span className="agenda-event-professional">
            {event.professionalName}
          </span>
        ) : null}
        <Link
          href={paths.paciente(event.patientId)}
          className="agenda-event-patient truncate text-inherit hover:underline"
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          {event.patientName}
        </Link>
      </div>
      {canDrag ? (
        <span
          className="agenda-event-drag-handle hidden md:inline-flex"
          title="Arrastar para remarcar"
          aria-hidden
        >
          <GripVertical className="size-4 shrink-0" />
        </span>
      ) : null}
    </div>
  );
}

export function AgendaCalendar({
  events,
  viewDateIso,
  loadedViewDateIso,
  calView,
  onCalViewChange,
  onViewDateChange,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  /** Data visível actual (estado client). */
  viewDateIso: string;
  /** Mês cujos eventos já vieram do servidor. */
  loadedViewDateIso: string;
  calView: "day" | "week" | "month";
  onCalViewChange: (view: "day" | "week" | "month") => void;
  onViewDateChange: (iso: string, needsServerFetch: boolean) => void;
  onSelectEvent?: (id: string) => void;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [localEvents, setLocalEvents] = useState(events);
  const [prevEvents, setPrevEvents] = useState(events);

  if (events !== prevEvents) {
    setPrevEvents(events);
    setLocalEvents(events);
  }

  const viewDate =
    parseIsoDateParam(viewDateIso) ?? new Date(`${viewDateIso}T12:00:00`);

  /** Em telemóvel só a vista dia é utilizável; week/month ficam no estado para o desktop. */
  const displayView: View = isMobile ? Views.DAY : calView;
  const availableViews = isMobile
    ? ([Views.DAY] as View[])
    : ([Views.DAY, Views.WEEK, Views.MONTH] as View[]);

  const onNavigate = useCallback(
    (newDate: Date) => {
      const loadedMonthDate =
        parseIsoDateParam(loadedViewDateIso) ??
        new Date(`${loadedViewDateIso}T12:00:00`);
      const iso = formatAppointmentDate(newDate);
      const needsServerFetch = !isSameCalendarMonth(newDate, loadedMonthDate);
      onViewDateChange(iso, needsServerFetch);
    },
    [loadedViewDateIso, onViewDateChange],
  );

  const onView = useCallback(
    (nextView: View) => {
      if (isMobile && nextView !== Views.DAY) return;
      if (
        nextView !== Views.DAY &&
        nextView !== Views.WEEK &&
        nextView !== Views.MONTH
      ) {
        return;
      }
      onCalViewChange(nextView);
    },
    [isMobile, onCalViewChange],
  );

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const style = calendarEventStyle(event.status, event.hasSessionNote);
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
          toast.error(result.message);
          return;
        }
        toast.success("Agendamento realocado");
        router.refresh();
      });
    },
    [localEvents, router],
  );

  return (
    <div className="agenda-calendar flex min-h-0 flex-1 flex-col rounded-md border border-border bg-card p-3 lg:p-4">
      <p className="mb-3 hidden shrink-0 text-sm text-muted-foreground md:block">
        Use o ícone à direita do agendamento para arrastar. Clique para editar.
      </p>
      <p className="mb-3 shrink-0 text-sm text-muted-foreground md:hidden">
        Vista do dia. Toque num agendamento para editar.
      </p>
      <div className="relative min-h-70 flex-1 md:min-h-105">
        <div className="absolute inset-0">
          <DnDCalendar
            localizer={localizer}
            events={localEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            date={viewDate}
            onNavigate={onNavigate}
            view={displayView}
            onView={onView}
            views={availableViews}
            step={30}
            timeslots={2}
            min={set(new Date(), { hours: 7, minutes: 0, seconds: 0 })}
            max={set(new Date(), { hours: 21, minutes: 0, seconds: 0 })}
            scrollToTime={set(new Date(), { hours: 8, minutes: 0, seconds: 0 })}
            popup
            culture="pt-BR"
            style={{ height: "100%" }}
            eventPropGetter={eventPropGetter}
            components={{ event: CalendarEventLabel }}
            onEventDrop={isMobile ? undefined : moveEvent}
            draggableAccessor={(event) =>
              !isMobile &&
              !isPending &&
              (event as CalendarEvent).status === "scheduled"
            }
            resizable={false}
            selectable={false}
            messages={CALENDAR_MESSAGES}
            onSelectEvent={(event) => onSelectEvent?.(event.id)}
          />
        </div>
      </div>
    </div>
  );
}
