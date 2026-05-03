'use client';

import { useMemo, useState } from 'react';

import { apiClient } from '@/lib/apiClient';
import { BookingModal } from './BookingModal';
import { ScheduleView } from './schedule';
import { getTodayKey, VIEW_LABELS, shiftDate, formatRangeLabel } from './schedule-utils';
import { LoadingState, MonthCalendar, DetailedCalendar, EmptyState } from './ScheduleCalendar';
import { useSchedule, useBookingForm, useBookingOptions, useDateTimeOptions, useAvailability } from './useSchedule';



export default function SchedulePage() {
  const [view, setView] = useState<ScheduleView>('day');
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [reloadKey, setReloadKey] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Schedule data
  // ---------------------------------------------------------------------------

  const { data, isLoading, statusMessage } = useSchedule(view, selectedDate, reloadKey);

  // ---------------------------------------------------------------------------
  // Booking state
  // ---------------------------------------------------------------------------

  const { bookingForm, setBookingForm, onChange: onBookingChange } = useBookingForm(selectedDate);

  const {
    services,
    isBookingLoading,
    bookingMessage,
    setBookingMessage,
  } = useBookingOptions(isBookingOpen);

  const [availableDates, setAvailableDates] = useState<
    import('./schedule').AvailableDateOption[]
  >([]);
  const [availableTimes, setAvailableTimes] = useState<
    import('./schedule').AvailableTimeOption[]
  >([]);
  const [availableBarbers, setAvailableBarbers] = useState<
    import('./schedule').AvailableBarberOption[]
  >([]);

  const { isDateOptionsLoading } = useDateTimeOptions(
    isBookingOpen,
    bookingForm.serviceId,
    bookingForm.date,
    ({ dates, times, selectedDate: newDate }) => {
      setAvailableDates(dates);
      setAvailableTimes(times);
      setBookingForm((current) => ({
        ...current,
        date: newDate,
        time: times.some((t) => t.value === current.time)
          ? current.time
          : times[0]?.value ?? '',
        barberId: '',
      }));
      setAvailableBarbers([]);
      setBookingMessage(null);
    },
    () => {
      setAvailableDates([]);
      setAvailableTimes([]);
      setAvailableBarbers([]);
      setBookingForm((current) => ({ ...current, date: '', time: '', barberId: '' }));
      setBookingMessage('Nao foi possivel consultar os barbeiros disponiveis.');
    },
  );

  const { isAvailabilityLoading } = useAvailability(
    isBookingOpen,
    bookingForm.serviceId,
    bookingForm.date,
    bookingForm.time,
    (barbers) => {
      setAvailableBarbers(barbers);
      setBookingForm((current) => ({
        ...current,
        barberId: barbers.some((b) => b.id === current.barberId)
          ? current.barberId
          : barbers[0]?.id ?? '',
      }));
      setBookingMessage(null);
    },
    (message) => {
      setAvailableBarbers([]);
      setBookingForm((current) => ({ ...current, barberId: '' }));
      setBookingMessage(message);
    },
  );

  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const dayMap = useMemo(() => {
    if (!data) return new Map<string, NonNullable<typeof data>['days'][number]>();
    return new Map(data.days.map((day) => [day.date, day]));
  }, [data]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function openBooking() {
    setBookingForm((current) => ({ ...current, date: selectedDate }));
    setIsBookingOpen(true);
  }

  function closeBooking() {
    setIsBookingOpen(false);
    setBookingMessage(null);
    setAvailableDates([]);
    setAvailableTimes([]);
    setAvailableBarbers([]);
  }

  async function handleSubmitBooking() {
    setIsSubmittingBooking(true);

    try {
      await apiClient('/schedule/appointments', {
        method: 'POST',
        body: JSON.stringify({
          customerName: bookingForm.customerName.trim(),
          customerPhone: bookingForm.customerPhone.trim(),
          customerEmail: bookingForm.customerEmail.trim() || undefined,
          userId: bookingForm.barberId,
          serviceIds: [bookingForm.serviceId],
          startDatetime: `${bookingForm.date}T${bookingForm.time}:00.000Z`,
        }),
      });

      setIsBookingOpen(false);
      setBookingMessage(null);
      setSelectedDate(bookingForm.date);
      setReloadKey((current) => current + 1);
    } catch (error) {
      console.error(error);
      setBookingMessage(
        error instanceof Error ? error.message : 'Nao foi possivel realizar o agendamento.',
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-full w-full flex-col bg-zinc-950 px-3 pb-24 pt-3 text-white sm:px-4 lg:px-6">
      {/* Header */}
      <div className="mx-auto mb-4 w-full max-w-6xl rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-amber-400/80">Schedule</p>
            <h1 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Agenda da barbearia
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-5 text-zinc-400">
              Agenda pensada para uso rapido no celular, com foco no dia atual e buffer visivel
              entre atendimentos.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[420px] lg:items-end">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(VIEW_LABELS) as ScheduleView[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={`rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                    option === view
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {VIEW_LABELS[option]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={openBooking}
              className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              Realizar agendamento
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, view, -1))}
                className="rounded-2xl border border-zinc-700 px-3 py-3 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayKey())}
                className="rounded-2xl border border-zinc-700 px-3 py-3 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDate(selectedDate, view, 1))}
                className="rounded-2xl border border-zinc-700 px-3 py-3 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                Proximo
              </button>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full bg-transparent text-sm text-zinc-200 outline-none"
              />
            </div>
          </div>
        </div>

        {data ? (
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-zinc-400 sm:grid-cols-3">
            <span className="rounded-2xl bg-zinc-800 px-3 py-2">
              Buffer padrao: {data.bufferMinutes} min
            </span>
            <span className="rounded-2xl bg-zinc-800 px-3 py-2">{formatRangeLabel(data)}</span>
            <span className="rounded-2xl bg-zinc-800 px-3 py-2">
              {data.barbers.length} barbeiros
            </span>
          </div>
        ) : null}
      </div>

      {/* Status error */}
      {statusMessage ? (
        <div className="mx-auto mb-4 w-full max-w-6xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {statusMessage}
        </div>
      ) : null}

      {/* Calendar */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        {isLoading ? (
          <LoadingState />
        ) : data ? (
          view === 'month' ? (
            <MonthCalendar data={data} />
          ) : (
            <DetailedCalendar data={data} dayMap={dayMap} />
          )
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Booking modal */}
      {isBookingOpen ? (
        <BookingModal
          bookingForm={bookingForm}
          bookingMessage={bookingMessage}
          services={services}
          availableDates={availableDates}
          availableTimes={availableTimes}
          availableBarbers={availableBarbers}
          isLoading={isBookingLoading}
          isDateOptionsLoading={isDateOptionsLoading}
          isAvailabilityLoading={isAvailabilityLoading}
          isSubmitting={isSubmittingBooking}
          onClose={closeBooking}
          onChange={onBookingChange}
          onSubmit={handleSubmitBooking}
        />
      ) : null}
    </div>
  );
}