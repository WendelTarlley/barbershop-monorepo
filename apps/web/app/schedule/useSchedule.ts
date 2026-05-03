import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/apiClient';
import { ScheduleView, ScheduleResponse, ServiceOption, AvailableDateOption, AvailableTimeOption, AvailableBarberOption, BookingFormValues } from './schedule';
import { getTodayKey } from './schedule-utils';


// ---------------------------------------------------------------------------
// useSchedule
// ---------------------------------------------------------------------------

export function useSchedule(
  view: ScheduleView,
  selectedDate: string,
  reloadKey: number,
) {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSchedule() {
      setIsLoading(true);

      try {
        const response = await apiClient(`/schedule?view=${view}&date=${selectedDate}`);

        if (!isMounted) return;

        setData(response as ScheduleResponse);
        setStatusMessage(null);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        setStatusMessage('Nao foi possivel carregar a agenda.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [reloadKey, selectedDate, view]);

  return { data, isLoading, statusMessage };
}

// ---------------------------------------------------------------------------
// useBookingOptions
// ---------------------------------------------------------------------------

export function useBookingOptions(isBookingOpen: boolean) {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isBookingOpen) return;

    let isMounted = true;

    async function loadBookingOptions() {
      setIsBookingLoading(true);

      try {
        const servicesResponse = await apiClient('/barbershop-service');

        if (!isMounted) return;

        const nextServices = (servicesResponse as ServiceOption[]).filter(
          (service) => service.active,
        );

        setServices(nextServices);
        setBookingMessage(null);
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setBookingMessage('Nao foi possivel carregar os dados para agendamento.');
        }
      } finally {
        if (isMounted) setIsBookingLoading(false);
      }
    }

    loadBookingOptions();

    return () => {
      isMounted = false;
    };
  }, [isBookingOpen]);

  return { services, isBookingLoading, bookingMessage, setBookingMessage };
}

// ---------------------------------------------------------------------------
// useDateTimeOptions
// ---------------------------------------------------------------------------

export function useDateTimeOptions(
  isBookingOpen: boolean,
  serviceId: string,
  date: string,
  onUpdate: (params: {
    dates: AvailableDateOption[];
    times: AvailableTimeOption[];
    selectedDate: string;
  }) => void,
  onError: () => void,
) {
  const [isDateOptionsLoading, setIsDateOptionsLoading] = useState(false);

  useEffect(() => {
    if (!isBookingOpen || !serviceId) return;

    let isMounted = true;

    async function loadDateTimeOptions() {
      setIsDateOptionsLoading(true);

      try {
        const response = (await apiClient(
          `/schedule/booking-options?serviceId=${serviceId}${
            date ? `&date=${date}` : ''
          }`,
        )) as {
          selectedDate: string;
          dates: AvailableDateOption[];
          times: AvailableTimeOption[];
        };

        if (!isMounted) return;

        onUpdate(response);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        onError();
      } finally {
        if (isMounted) setIsDateOptionsLoading(false);
      }
    }

    loadDateTimeOptions();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, date, isBookingOpen]);

  return { isDateOptionsLoading };
}

// ---------------------------------------------------------------------------
// useAvailability
// ---------------------------------------------------------------------------

export function useAvailability(
  isBookingOpen: boolean,
  serviceId: string,
  date: string,
  time: string,
  onUpdate: (barbers: AvailableBarberOption[]) => void,
  onError: (message: string) => void,
) {
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);

  useEffect(() => {
    if (!isBookingOpen || !serviceId || !date || !time) return;

    let isMounted = true;

    async function loadAvailability() {
      setIsAvailabilityLoading(true);

      try {
        const response = (await apiClient(
          `/schedule/availability?serviceId=${serviceId}&startDatetime=${encodeURIComponent(
            `${date}T${time}:00.000Z`,
          )}`,
        )) as { barbers: AvailableBarberOption[] };

        if (!isMounted) return;

        onUpdate(response.barbers);
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        onError(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel consultar os barbeiros disponiveis.',
        );
      } finally {
        if (isMounted) setIsAvailabilityLoading(false);
      }
    }

    loadAvailability();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, serviceId, time, isBookingOpen]);

  return { isAvailabilityLoading };
}

// ---------------------------------------------------------------------------
// useBookingForm
// ---------------------------------------------------------------------------

export function useBookingForm(initialDate: string) {
  const [bookingForm, setBookingForm] = useState<BookingFormValues>(() => ({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    barberId: '',
    serviceId: '',
    date: initialDate || getTodayKey(),
    time: '09:00',
  }));

  function onChange(field: keyof BookingFormValues, value: string) {
    setBookingForm((current) => ({ ...current, [field]: value }));
  }

  function reset(overrides?: Partial<BookingFormValues>) {
    setBookingForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      barberId: '',
      serviceId: '',
      date: initialDate || getTodayKey(),
      time: '09:00',
      ...overrides,
    });
  }

  return { bookingForm, setBookingForm, onChange, reset };
}
