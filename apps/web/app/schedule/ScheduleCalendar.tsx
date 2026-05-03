import { useMemo } from 'react';

import { Avatar } from './Avatar';
import { ScheduleResponse, ScheduleBarber, ScheduleAppointment } from './schedule';
import { getAppointmentsForDate, formatTimeRange, getStatusLabel, getDurationMinutes, selectedMonthKey } from './schedule-utils';

// ---------------------------------------------------------------------------
// DetailedCalendar (day / week views)
// ---------------------------------------------------------------------------

export function DetailedCalendar({
  data,
  dayMap,
}: {
  data: ScheduleResponse;
  dayMap: Map<string, ScheduleResponse['days'][number]>;
}) {
  return (
    <div className="flex-1 space-y-3 pb-20">
      {data.days.map((day) => {
        const dayLabel = dayMap.get(day.date)?.label ?? day.date;
        const visibleBarbers = data.barbers.filter(
          (barber) => getAppointmentsForDate(barber.appointments, day.date).length > 0,
        );
        const appointmentsCount = visibleBarbers.reduce(
          (total, barber) =>
            total + getAppointmentsForDate(barber.appointments, day.date).length,
          0,
        );

        return (
          <section
            key={day.date}
            className="rounded-[24px] border border-zinc-800 bg-zinc-900/80 p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white capitalize sm:text-lg">
                  {dayLabel}
                </h2>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  {appointmentsCount} agendamentos no dia
                </p>
              </div>
              {day.isToday ? (
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-medium text-amber-300">
                  Hoje
                </span>
              ) : null}
            </div>

            {visibleBarbers.length > 0 ? (
              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {visibleBarbers.map((barber) => (
                  <BarberColumn
                    key={`${day.date}-${barber.id}`}
                    barber={barber}
                    date={day.date}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-center">
                <p className="text-sm font-medium text-zinc-300">Nenhum agendamento neste dia</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Os barbeiros aparecem somente quando tiverem atendimento na data exibida.
                </p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BarberColumn
// ---------------------------------------------------------------------------

function BarberColumn({ barber, date }: { barber: ScheduleBarber; date: string }) {
  const appointments = getAppointmentsForDate(barber.appointments, date);

  return (
    <div className="rounded-[24px] border border-zinc-800 bg-zinc-950/70 p-3.5 sm:p-4">
      <div className="mb-3 flex items-center gap-3">
        <Avatar photoUrl={barber.photoUrl} name={barber.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{barber.name}</p>
          <p className="truncate text-xs text-zinc-400">
            {barber.specialty ?? 'Sem especialidade'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppointmentCard
// ---------------------------------------------------------------------------

function AppointmentCard({ appointment }: { appointment: ScheduleAppointment }) {
  return (
    <article className="rounded-[20px] border border-amber-400/10 bg-zinc-900 p-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-300">
            {formatTimeRange(appointment.startDatetime, appointment.endDatetime)}
          </p>
          <h3 className="mt-2 truncate text-sm font-semibold text-white">
            {appointment.customer.name}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">{appointment.serviceNames.join(' + ')}</p>
        </div>

        <div className="ml-auto flex flex-col items-end gap-2">
          <div title={appointment.barber.name}>
            <Avatar
              photoUrl={appointment.barber.photoUrl}
              name={appointment.barber.name}
              size="sm"
            />
          </div>
          <div className="rounded-full border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[11px] font-medium text-zinc-300">
            {getStatusLabel(appointment.status)}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <span className="truncate">Barbeiro: {appointment.barber.name}</span>
        <span className="text-right">
          {getDurationMinutes(appointment.startDatetime, appointment.endDatetime)} min
        </span>
      </div>

      <div className="mt-3 rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-[11px] text-zinc-500">
        Buffer visual: {appointment.buffer.durationMinutes} min apos o atendimento
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// MonthCalendar
// ---------------------------------------------------------------------------

export function MonthCalendar({ data }: { data: ScheduleResponse }) {
  const appointmentMap = useMemo(() => {
    const map = new Map<string, ScheduleAppointment[]>();

    for (const barber of data.barbers) {
      for (const appointment of barber.appointments) {
        const date = appointment.startDatetime.slice(0, 10);
        const currentList = map.get(date) ?? [];
        currentList.push(appointment);
        map.set(date, currentList);
      }
    }

    return map;
  }, [data.barbers]);

  const monthReference = selectedMonthKey(data.selectedDate);

  return (
    <div className="grid flex-1 grid-cols-1 gap-3 pb-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {data.days.map((day) => {
        const appointments = appointmentMap.get(day.date) ?? [];
        const isCurrentMonth = selectedMonthKey(day.date) === monthReference;

        return (
          <div
            key={day.date}
            className={`min-h-40 rounded-[24px] border p-4 ${
              isCurrentMonth
                ? 'border-zinc-800 bg-zinc-900/80'
                : 'border-zinc-900 bg-zinc-950/80'
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {day.shortLabel}
                </p>
                <p className="text-sm font-semibold text-white">{day.monthLabel}</p>
              </div>
              {day.isToday ? (
                <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                  Hoje
                </span>
              ) : null}
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.slice(0, 2).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-[18px] border border-zinc-800 bg-zinc-950/80 px-3 py-2"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-amber-300">
                      {formatTimeRange(appointment.startDatetime, appointment.endDatetime)}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {appointment.customer.name}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] text-zinc-500">
                        {appointment.serviceNames.join(' + ')}
                      </p>
                      <span className="text-[10px] text-zinc-600">
                        +{appointment.buffer.durationMinutes}m
                      </span>
                    </div>
                  </div>
                ))}

                {appointments.length > 2 ? (
                  <p className="text-xs text-zinc-500">+{appointments.length - 2} agendamentos</p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 px-3 py-6 text-center text-xs text-zinc-600">
                Sem agendamentos
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading / Empty states
// ---------------------------------------------------------------------------

export function LoadingState() {
  return (
    <div className="min-h-full space-y-3 pb-20">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="rounded-[24px] border border-zinc-800 bg-zinc-900/80 p-4"
        >
          <div className="mb-4 h-6 w-48 animate-pulse rounded-full bg-zinc-800" />
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2].map((column) => (
              <div key={column} className="h-64 animate-pulse rounded-3xl bg-zinc-800/80" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center rounded-[24px] border border-dashed border-zinc-800 bg-zinc-900/40 px-5 py-10 text-center">
      <div>
        <p className="text-base font-semibold text-white">Agenda indisponivel</p>
        <p className="mt-2 text-sm text-zinc-400">
          Tente novamente em instantes para carregar os agendamentos.
        </p>
      </div>
    </div>
  );
}
