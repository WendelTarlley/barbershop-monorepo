'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClient } from '@/lib/apiClient';

type ScheduleView = 'day' | 'week' | 'month';

type ScheduleAppointment = {
  id: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  customer: {
    id: string;
    name: string;
  };
  barber: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    durationMinutes: number;
  }>;
  serviceNames: string[];
  buffer: {
    startDatetime: string;
    endDatetime: string;
    durationMinutes: number;
  };
};

type ScheduleBlock = {
  id: string;
  type: string;
  reason: string | null;
  allDay: boolean;
  startDatetime: string;
  endDatetime: string;
  label: string;
  barber: {
    id: string;
    name: string;
  };
};

type ScheduleBarber = {
  id: string;
  name: string;
  photoUrl: string | null;
  specialty: string | null;
  appointments: ScheduleAppointment[];
  blocks: ScheduleBlock[];
};

type ScheduleResponse = {
  view: ScheduleView;
  selectedDate: string;
  rangeStart: string;
  rangeEnd: string;
  bufferMinutes: number;
  days: Array<{
    date: string;
    label: string;
    shortLabel: string;
    monthLabel: string;
    isToday: boolean;
  }>;
  barbers: ScheduleBarber[];
};

type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  active: boolean;
};

type BookingFormValues = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
};

type AvailableBarberOption = {
  id: string;
  name: string;
  specialty: string | null;
  photoUrl: string | null;
};

type AvailableDateOption = {
  date: string;
  label: string;
};

type AvailableTimeOption = {
  value: string;
  label: string;
};

const VIEW_LABELS: Record<ScheduleView, string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mes',
};

export default function SchedulePage() {
  const [view, setView] = useState<ScheduleView>('day');
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDateOption[]>([]);
  const [availableTimes, setAvailableTimes] = useState<AvailableTimeOption[]>([]);
  const [availableBarbers, setAvailableBarbers] = useState<AvailableBarberOption[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isDateOptionsLoading, setIsDateOptionsLoading] = useState(false);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormValues>(() => ({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    barberId: '',
    serviceId: '',
    date: getTodayKey(),
    time: '09:00',
  }));

  useEffect(() => {
    let isMounted = true;

    async function loadSchedule() {
      setIsLoading(true);

      try {
        const response = await apiClient(
          `/schedule?view=${view}&date=${selectedDate}`,
        );

        if (!isMounted) {
          return;
        }

        setData(response as ScheduleResponse);
        setStatusMessage(null);
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        setStatusMessage('Nao foi possivel carregar a agenda.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [reloadKey, selectedDate, view]);

  useEffect(() => {
    if (!isBookingOpen) {
      return;
    }

    let isMounted = true;

    async function loadBookingOptions() {
      setIsBookingLoading(true);

      try {
        const servicesResponse = await apiClient('/barbershop-service');

        if (!isMounted) {
          return;
        }

        const nextServices = (servicesResponse as ServiceOption[]).filter(
          (service) => service.active,
        );

        setServices(nextServices);
        setAvailableDates([]);
        setAvailableTimes([]);
        setAvailableBarbers([]);
        setBookingMessage(null);
        setBookingForm((current) => ({
          ...current,
          serviceId: current.serviceId || nextServices[0]?.id || '',
          date: current.date || '',
          time: '',
          barberId: '',
        }));
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setBookingMessage('Nao foi possivel carregar os dados para agendamento.');
        }
      } finally {
        if (isMounted) {
          setIsBookingLoading(false);
        }
      }
    }

    loadBookingOptions();

    return () => {
      isMounted = false;
    };
  }, [isBookingOpen, selectedDate]);

  useEffect(() => {
    if (!isBookingOpen || !bookingForm.serviceId) {
      return;
    }

    let isMounted = true;

    async function loadBookingOptions() {
      setIsDateOptionsLoading(true);

      try {
        const response = (await apiClient(
          `/schedule/booking-options?serviceId=${bookingForm.serviceId}${
            bookingForm.date ? `&date=${bookingForm.date}` : ''
          }`,
        )) as {
          selectedDate: string;
          dates: AvailableDateOption[];
          times: AvailableTimeOption[];
        };

        if (!isMounted) {
          return;
        }

        setAvailableDates(response.dates);
        setAvailableTimes(response.times);
        setBookingForm((current) => ({
          ...current,
          date: response.selectedDate,
          time: response.times.some((time) => time.value === current.time)
            ? current.time
            : response.times[0]?.value ?? '',
          barberId: '',
        }));
        setAvailableBarbers([]);
        setBookingMessage(null);
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        setAvailableDates([]);
        setAvailableTimes([]);
        setAvailableBarbers([]);
        setBookingForm((current) => ({
          ...current,
          date: '',
          time: '',
          barberId: '',
        }));
        setBookingMessage(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel consultar os barbeiros disponiveis.',
        );
      } finally {
        if (isMounted) {
          setIsDateOptionsLoading(false);
        }
      }
    }

    loadBookingOptions();

    return () => {
      isMounted = false;
    };
  }, [
    bookingForm.serviceId,
    bookingForm.date,
    isBookingOpen,
  ]);

  useEffect(() => {
    if (!isBookingOpen || !bookingForm.serviceId || !bookingForm.date || !bookingForm.time) {
      return;
    }

    let isMounted = true;

    async function loadAvailability() {
      setIsAvailabilityLoading(true);

      try {
        const response = (await apiClient(
          `/schedule/availability?serviceId=${bookingForm.serviceId}&startDatetime=${encodeURIComponent(
            `${bookingForm.date}T${bookingForm.time}:00.000Z`,
          )}`,
        )) as {
          barbers: AvailableBarberOption[];
        };

        if (!isMounted) {
          return;
        }

        setAvailableBarbers(response.barbers);
        setBookingForm((current) => ({
          ...current,
          barberId: response.barbers.some((barber) => barber.id === current.barberId)
            ? current.barberId
            : response.barbers[0]?.id ?? '',
        }));
        setBookingMessage(null);
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        setAvailableBarbers([]);
        setBookingForm((current) => ({
          ...current,
          barberId: '',
        }));
        setBookingMessage(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel consultar os barbeiros disponiveis.',
        );
      } finally {
        if (isMounted) {
          setIsAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [
    bookingForm.date,
    bookingForm.serviceId,
    bookingForm.time,
    isBookingOpen,
  ]);

  const dayMap = useMemo(() => {
    if (!data) {
      return new Map<string, ScheduleResponse['days'][number]>();
    }

    return new Map(data.days.map((day) => [day.date, day]));
  }, [data]);

  return (
    <div className="flex min-h-full w-full flex-col bg-zinc-950 px-3 pb-24 pt-3 text-white sm:px-4 lg:px-6">
      <div className="mx-auto mb-4 w-full max-w-6xl rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-amber-400/80">
              Schedule
            </p>
            <h1 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Agenda da barbearia
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-5 text-zinc-400">
              Agenda pensada para uso rapido no celular, com foco no dia atual e
              buffer visivel entre atendimentos.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[420px] lg:items-end">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(VIEW_LABELS) as ScheduleView[]).map((option) => {
                const isActive = option === view;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setView(option)}
                    className={`rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-400 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {VIEW_LABELS[option]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setBookingForm((current) => ({
                  ...current,
                  date: selectedDate,
                }));
                setIsBookingOpen(true);
              }}
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
            <span className="rounded-2xl bg-zinc-800 px-3 py-2">
              {formatRangeLabel(data)}
            </span>
            <span className="rounded-2xl bg-zinc-800 px-3 py-2">
              {data.barbers.length} barbeiros
            </span>
          </div>
        ) : null}
      </div>

      {statusMessage ? (
        <div className="mx-auto mb-4 w-full max-w-6xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {statusMessage}
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        {isLoading ? (
          <LoadingState />
        ) : data ? (
          <>
            {view === 'month' ? (
              <MonthCalendar data={data} />
            ) : (
              <DetailedCalendar data={data} dayMap={dayMap} />
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </div>

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
          onClose={() => {
            setIsBookingOpen(false);
            setBookingMessage(null);
            setAvailableDates([]);
            setAvailableTimes([]);
            setAvailableBarbers([]);
          }}
          onChange={(field, value) => {
            setBookingForm((current) => ({
              ...current,
              [field]: value,
            }));
          }}
          onSubmit={async () => {
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
                error instanceof Error
                  ? error.message
                  : 'Nao foi possivel realizar o agendamento.',
              );
            } finally {
              setIsSubmittingBooking(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function BookingModal({
  bookingForm,
  bookingMessage,
  services,
  availableDates,
  availableTimes,
  availableBarbers,
  isLoading,
  isDateOptionsLoading,
  isAvailabilityLoading,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: {
  bookingForm: BookingFormValues;
  bookingMessage: string | null;
  services: ServiceOption[];
  availableDates: AvailableDateOption[];
  availableTimes: AvailableTimeOption[];
  availableBarbers: AvailableBarberOption[];
  isLoading: boolean;
  isDateOptionsLoading: boolean;
  isAvailabilityLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (field: keyof BookingFormValues, value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  const canSubmit =
    bookingForm.serviceId &&
    bookingForm.date &&
    bookingForm.time &&
    bookingForm.barberId &&
    bookingForm.customerName.trim() &&
    bookingForm.customerPhone.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:p-4 sm:items-center">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-zinc-800 bg-zinc-900 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:max-w-xl sm:rounded-[28px] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-400/80">
              Novo agendamento
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Realizar agendamento
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Use este formulario para testar a exibicao da agenda.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Fechar
          </button>
        </div>

        {bookingMessage ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {bookingMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-2xl bg-zinc-800"
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">
                  Etapa 1
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  Escolha o servico
                </h3>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="text-zinc-300">Servico</span>
                <select
                  value={bookingForm.serviceId}
                  onChange={(event) => onChange('serviceId', event.target.value)}
                  className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} • {service.durationMinutes} min
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">
                  Etapa 2
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  Defina data e horario
                </h3>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Datas disponiveis</span>
                  {isDateOptionsLoading ? (
                    <div className="h-12 animate-pulse rounded-2xl bg-zinc-800" />
                  ) : availableDates.length > 0 ? (
                    <SelectField
                      value={bookingForm.date}
                      onChange={(event) => onChange('date', event.target.value)}
                      options={availableDates.map((dateOption) => ({
                        value: dateOption.date,
                        label: dateOption.label,
                      }))}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-center text-xs text-zinc-500">
                      Nenhuma data disponivel para este servico.
                    </div>
                  )}
                </div>

                <div className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Horarios disponiveis</span>
                  {isDateOptionsLoading ? (
                    <div className="h-12 animate-pulse rounded-2xl bg-zinc-800" />
                  ) : availableTimes.length > 0 ? (
                    <SelectField
                      value={bookingForm.time}
                      onChange={(event) => onChange('time', event.target.value)}
                      options={availableTimes.map((timeOption) => ({
                        value: timeOption.value,
                        label: timeOption.label,
                      }))}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-center text-xs text-zinc-500">
                      Nenhum horario disponivel para a data selecionada.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">
                  Etapa 3
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  Escolha um barbeiro disponivel
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  A lista considera a duracao do servico e a agenda disponivel.
                </p>
              </div>

              {isAvailabilityLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-2xl bg-zinc-800"
                    />
                  ))}
                </div>
              ) : availableBarbers.length > 0 ? (
                <div className="grid gap-2">
                  {availableBarbers.map((barber) => {
                    const isSelected = barber.id === bookingForm.barberId;

                    return (
                      <button
                        key={barber.id}
                        type="button"
                        onClick={() => onChange('barberId', barber.id)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
                        }`}
                      >
                        <Avatar photoUrl={barber.photoUrl} name={barber.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {barber.name}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            {barber.specialty ?? 'Disponivel para o servico'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-zinc-300">
                    Nenhum barbeiro disponivel
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Ajuste o horario ou escolha outro servico para continuar.
                  </p>
                </div>
              )}
            </section>

            <section className="grid gap-3 rounded-[24px] border border-zinc-800 bg-zinc-950/50 p-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80">
                  Etapa 4
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  Identifique o cliente
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Para este fluxo inicial, basta nome e telefone.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm md:col-span-2">
                  <span className="text-zinc-300">Nome do cliente</span>
                  <input
                    value={bookingForm.customerName}
                    onChange={(event) => onChange('customerName', event.target.value)}
                    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Telefone</span>
                  <input
                    value={bookingForm.customerPhone}
                    onChange={(event) => onChange('customerPhone', event.target.value)}
                    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Email opcional</span>
                  <input
                    value={bookingForm.customerEmail}
                    onChange={(event) => onChange('customerEmail', event.target.value)}
                    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                  />
                </label>
              </div>
            </section>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !canSubmit}
              className="mt-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Agendando...' : 'Confirmar agendamento'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-transparent px-4 py-3 pr-11 text-sm font-medium text-zinc-100 outline-none"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-zinc-950 text-zinc-100"
          >
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-500">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

function DetailedCalendar({
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
        const visibleBarbers = data.barbers.filter((barber) => {
          return getAppointmentsForDate(barber.appointments, day.date).length > 0;
        });
        const appointmentsCount = visibleBarbers.reduce((total, barber) => {
          return total + getAppointmentsForDate(barber.appointments, day.date).length;
        }, 0);

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
                <p className="text-sm font-medium text-zinc-300">
                  Nenhum agendamento neste dia
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Os barbeiros aparecem somente quando tiverem atendimento na
                  data exibida.
                </p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function BarberColumn({
  barber,
  date,
}: {
  barber: ScheduleBarber;
  date: string;
}) {
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
          <p className="mt-1 text-xs text-zinc-400">
            {appointment.serviceNames.join(' + ')}
          </p>
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

function MonthCalendar({ data }: { data: ScheduleResponse }) {
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
                  <p className="text-xs text-zinc-500">
                    +{appointments.length - 2} agendamentos
                  </p>
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

function LoadingState() {
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
              <div
                key={column}
                className="h-64 animate-pulse rounded-3xl bg-zinc-800/80"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
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

function Avatar({
  photoUrl,
  name,
  size,
}: {
  photoUrl: string | null;
  name: string;
  size: 'sm' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-sm' : 'h-8 w-8 text-[11px]';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        title={name}
        className={`${sizeClass} rounded-full border border-zinc-700 object-cover`}
      />
    );
  }

  return (
    <div
      title={name}
      className={`${sizeClass} flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-semibold text-zinc-200`}
    >
      {getInitials(name)}
    </div>
  );
}

function getAppointmentsForDate(
  appointments: ScheduleAppointment[],
  date: string,
) {
  return appointments.filter((appointment) => appointment.startDatetime.slice(0, 10) === date);
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function formatRangeLabel(data: ScheduleResponse) {
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

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(date: string, view: ScheduleView, step: number) {
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

function getStatusLabel(status: string) {
  if (status === 'CONFIRMED') {
    return 'Confirmado';
  }

  if (status === 'COMPLETED') {
    return 'Concluido';
  }

  if (status === 'PENDING') {
    return 'Pendente';
  }

  return 'Cancelado';
}

function getDurationMinutes(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function selectedMonthKey(date: string) {
  return date.slice(0, 7);
}
