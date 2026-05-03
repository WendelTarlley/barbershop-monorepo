export type ScheduleView = 'day' | 'week' | 'month';

export type ScheduleAppointment = {
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

export type ScheduleBlock = {
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

export type ScheduleBarber = {
  id: string;
  name: string;
  photoUrl: string | null;
  specialty: string | null;
  appointments: ScheduleAppointment[];
  blocks: ScheduleBlock[];
};

export type ScheduleResponse = {
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

export type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  active: boolean;
};

export type BookingFormValues = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
};

export type AvailableBarberOption = {
  id: string;
  name: string;
  specialty: string | null;
  photoUrl: string | null;
};

export type AvailableDateOption = {
  date: string;
  label: string;
};

export type AvailableTimeOption = {
  value: string;
  label: string;
};
