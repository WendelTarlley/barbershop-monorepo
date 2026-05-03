import { ScheduleView, ScheduleResponse, ScheduleAppointment } from "./schedule";

export const VIEW_LABELS: Record<ScheduleView, string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mes',
};

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function shiftDate(date: string, view: ScheduleView, step: number) {
  const baseDate = new Date(`${date}T00:00:00.000Z`);

  if (view === 'day') {
    baseDate.setUTCDate(baseDate.getUTCDate() + step);
  } else if (view === 'week') {
    baseDate.setUTCDate(baseDate.getUTCDate() + step * 7);
  } else {
    baseDate.setUTCMonth(baseDate.getUTCMonth() + step);
  }

  return baseDate.toISOString().slice(0, 10);
}

export function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function formatRangeLabel(data: ScheduleResponse) {
  const start = new Date(data.rangeStart);
  const end = new Date(data.rangeEnd);

  return `${new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(start)} ate ${new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(end.getTime() - 1))}`;
}

export function getStatusLabel(status: string) {
  if (status === 'CONFIRMED') return 'Confirmado';
  if (status === 'COMPLETED') return 'Concluido';
  if (status === 'PENDING') return 'Pendente';
  return 'Cancelado';
}

export function getDurationMinutes(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function selectedMonthKey(date: string) {
  return date.slice(0, 7);
}

export function getAppointmentsForDate(
  appointments: ScheduleAppointment[],
  date: string,
) {
  return appointments.filter(
    (appointment) => appointment.startDatetime.slice(0, 10) === date,
  );
}
