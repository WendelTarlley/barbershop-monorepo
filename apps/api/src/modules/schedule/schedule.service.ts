import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AppointmentStatus,
  Prisma,
  ScheduleBlockType,
} from '@barbershop/database';

import { BarbershopContextService } from '../../common/barbershop-context/barbershop-context.service';
import { PrismaService } from '../../prisma/prisma.service';

type CalendarView = 'day' | 'week' | 'month';

type CalendarQuery = {
  view?: string;
  date?: string;
};

type AvailabilityQuery = {
  serviceId?: string;
  startDatetime?: string;
};

type BookingOptionsQuery = {
  serviceId?: string;
  date?: string;
};

type CreateScheduleAppointmentInput = {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  userId: string;
  serviceIds: string[];
  startDatetime: string;
  bufferMinutes?: number;
};

const DEFAULT_BUFFER_MINUTES = 10;
const VALID_VIEWS: CalendarView[] = ['day', 'week', 'month'];
const SLOT_INTERVAL_MINUTES = 30;
const BOOKING_WINDOW_DAYS = 14;

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly barbershopContext: BarbershopContextService,
  ) {}

  async getCalendar(query: CalendarQuery) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    const view = this.normalizeView(query.view);
    const selectedDate = this.parseDateInput(query.date);
    const range = this.getRangeForView(selectedDate, view);

    const [barbers, appointments, blocks] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          barbershopId,
          role: { name: 'Barbeiro' },
        },
        orderBy: [{ name: 'asc' }],
        select: {
          id: true,
          name: true,
          photoUrl: true,
          specialty: true,
        },
      }),
      this.prismaService.appointment.findMany({
        where: {
          barbershopId,
          startDatetime: { lt: range.endExclusive },
          endDatetime: { gt: range.start },
          status: {
            notIn: [AppointmentStatus.CANCELLED],
          },
        },
        orderBy: [{ startDatetime: 'asc' }],
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
            },
          },
          services: {
            include: {
              barbershopService: {
                select: {
                  id: true,
                  name: true,
                  durationMinutes: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.block.findMany({
        where: {
          user: {
            barbershopId,
            role: { name: 'Barbeiro' },
          },
          startDatetime: { lt: range.endExclusive },
          endDatetime: { gt: range.start },
        },
        orderBy: [{ startDatetime: 'asc' }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      view,
      selectedDate: this.formatDateKey(selectedDate),
      rangeStart: range.start.toISOString(),
      rangeEnd: range.endExclusive.toISOString(),
      bufferMinutes: DEFAULT_BUFFER_MINUTES,
      days: this.buildDays(range.start, range.endInclusive),
      barbers: barbers.map((barber) => ({
        ...barber,
        appointments: appointments
          .filter((appointment) => appointment.userId === barber.id)
          .map((appointment) => this.serializeAppointment(appointment)),
        blocks: blocks
          .filter((block) => block.userId === barber.id)
          .map((block) => this.serializeBlock(block)),
      })),
    };
  }

  async getAvailability(query: AvailabilityQuery) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    const serviceId = query.serviceId?.trim();
    const startDatetime = this.parseDateTimeInput(query.startDatetime);

    if (!serviceId) {
      throw new BadRequestException('Service id is required.');
    }

    const service = await this.prismaService.barbershopService.findFirst({
      where: {
        id: serviceId,
        barbershopId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
      },
    });

    if (!service) {
      throw new BadRequestException('Service not found.');
    }

    const explicitAssignments = await this.prismaService.barberService.findMany({
      where: {
        barbershopServiceId: serviceId,
        user: {
          barbershopId,
          active: true,
          role: { name: 'Barbeiro' },
        },
      },
      select: {
        userId: true,
      },
    });

    const assignedUserIds = explicitAssignments.map((assignment) => assignment.userId);

    const barbers = await this.prismaService.user.findMany({
      where: {
        barbershopId,
        active: true,
        role: { name: 'Barbeiro' },
        ...(assignedUserIds.length > 0 ? { id: { in: assignedUserIds } } : {}),
      },
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
        name: true,
        specialty: true,
        photoUrl: true,
      },
    });

    const availableBarbers = await Promise.all(
      barbers.map(async (barber) => {
        const endDatetime = new Date(
          startDatetime.getTime() + service.durationMinutes * 60 * 1000,
        );
        const bufferedEndDatetime = new Date(
          endDatetime.getTime() + DEFAULT_BUFFER_MINUTES * 60 * 1000,
        );

        const isAvailable = await this.isBarberAvailable({
          barbershopId,
          userId: barber.id,
          startDatetime,
          endDatetime,
          bufferedEndDatetime,
        });

        return {
          ...barber,
          isAvailable,
        };
      }),
    );

    return {
      service,
      startDatetime: startDatetime.toISOString(),
      endDatetime: new Date(
        startDatetime.getTime() + service.durationMinutes * 60 * 1000,
      ).toISOString(),
      bufferMinutes: DEFAULT_BUFFER_MINUTES,
      barbers: availableBarbers.filter((barber) => barber.isAvailable),
    };
  }

  async getBookingOptions(query: BookingOptionsQuery) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    const serviceId = query.serviceId?.trim();

    if (!serviceId) {
      throw new BadRequestException('Service id is required.');
    }

    const service = await this.prismaService.barbershopService.findFirst({
      where: {
        id: serviceId,
        barbershopId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
      },
    });

    if (!service) {
      throw new BadRequestException('Service not found.');
    }

    const eligibleBarbers = await this.getEligibleBarbers(barbershopId, serviceId);
    const workingDays = await this.prismaService.workingDay.findMany({
      where: {
        barbershopId,
        active: true,
      },
      orderBy: [{ weekDay: 'asc' }],
    });

    const availabilityByBarber = await this.prismaService.availability.findMany({
      where: {
        userId: {
          in: eligibleBarbers.map((barber) => barber.id),
        },
      },
    });

    const availableDates: Array<{
      date: string;
      label: string;
    }> = [];

    for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
      const date = this.addDays(this.startOfDay(new Date()), offset);
      const slots = await this.getAvailableTimesForDate({
        barbershopId,
        date,
        serviceDurationMinutes: service.durationMinutes,
        eligibleBarbers,
        workingDays,
        availabilityByBarber,
      });

      if (slots.length > 0) {
        availableDates.push({
          date: this.formatDateKey(date),
          label: this.formatBookingDateLabel(date),
        });
      }
    }

    const selectedDate =
      query.date && availableDates.some((item) => item.date === query.date)
        ? this.parseDateInput(query.date)
        : availableDates[0]
          ? this.parseDateInput(availableDates[0].date)
          : this.startOfDay(new Date());

    const timeSlots = await this.getAvailableTimesForDate({
      barbershopId,
      date: selectedDate,
      serviceDurationMinutes: service.durationMinutes,
      eligibleBarbers,
      workingDays,
      availabilityByBarber,
    });

    return {
      service,
      selectedDate: this.formatDateKey(selectedDate),
      dates: availableDates,
      times: timeSlots,
    };
  }

  async createAppointment(input: CreateScheduleAppointmentInput) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    const customerId = input.customerId?.trim();
    const customerName = input.customerName?.trim();
    const customerPhone = input.customerPhone?.trim();
    const customerEmail = input.customerEmail?.trim().toLowerCase() || null;
    const userId = input.userId?.trim();
    const serviceIds = Array.from(
      new Set((input.serviceIds ?? []).map((serviceId) => serviceId?.trim()).filter(Boolean)),
    );
    const startDatetime = this.parseDateTimeInput(input.startDatetime);
    const bufferMinutes = this.normalizeBufferMinutes(input.bufferMinutes);

    if (!userId) {
      throw new BadRequestException('Barber id is required.');
    }

    if (serviceIds.length === 0) {
      throw new BadRequestException('At least one service is required.');
    }

    const [barber, services] = await Promise.all([
      this.prismaService.user.findFirst({
        where: {
          id: userId,
          barbershopId,
          role: { name: 'Barbeiro' },
        },
        select: {
          id: true,
          name: true,
        },
      }),
      this.prismaService.barbershopService.findMany({
        where: {
          id: { in: serviceIds },
          barbershopId,
          active: true,
        },
        select: {
          id: true,
          name: true,
          durationMinutes: true,
        },
      }),
    ]);

    if (!barber) {
      throw new BadRequestException('Barber not found.');
    }

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('One or more services are invalid.');
    }

    const totalDurationMinutes = services.reduce(
      (total, service) => total + service.durationMinutes,
      0,
    );
    const endDatetime = new Date(
      startDatetime.getTime() + totalDurationMinutes * 60 * 1000,
    );
    const bufferedEndDatetime = new Date(
      endDatetime.getTime() + bufferMinutes * 60 * 1000,
    );

    const customer = customerId
      ? await this.prismaService.customer.findUnique({
          where: { id: customerId },
          select: { id: true, name: true },
        })
      : await this.createInlineCustomer({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        });

    if (!customer) {
      throw new BadRequestException('Customer not found.');
    }

    await this.ensureBarberIsAvailable({
      barbershopId,
      userId,
      startDatetime,
      endDatetime,
      bufferedEndDatetime,
    });

    const appointment = await this.prismaService.appointment.create({
      data: {
        barbershopId,
        userId,
        customerId: customer.id,
        startDatetime,
        endDatetime,
        status: AppointmentStatus.CONFIRMED,
        services: {
          create: serviceIds.map((serviceId) => ({
            barbershopServiceId: serviceId,
          })),
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        services: {
          include: {
            barbershopService: {
              select: {
                id: true,
                name: true,
                durationMinutes: true,
              },
            },
          },
        },
      },
    });

    return this.serializeAppointment(appointment);
  }

  private normalizeView(view?: string): CalendarView {
    if (!view) {
      return 'day';
    }

    if (!VALID_VIEWS.includes(view as CalendarView)) {
      throw new BadRequestException('Invalid schedule view.');
    }

    return view as CalendarView;
  }

  private parseDateInput(rawDate?: string) {
    if (!rawDate) {
      return this.startOfDay(new Date());
    }

    const normalizedDate = rawDate.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedDate);

    if (!match) {
      throw new BadRequestException('Date must use YYYY-MM-DD format.');
    }

    const [, yearString, monthString, dayString] = match;
    const parsedDate = new Date(
      Date.UTC(Number(yearString), Number(monthString) - 1, Number(dayString)),
    );

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid schedule date.');
    }

    return parsedDate;
  }

  private parseDateTimeInput(rawDateTime?: string) {
    const normalizedDateTime = rawDateTime?.trim();

    if (!normalizedDateTime) {
      throw new BadRequestException('Start datetime is required.');
    }

    const parsedDate = new Date(normalizedDateTime);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid start datetime.');
    }

    return parsedDate;
  }

  private normalizeBufferMinutes(bufferMinutes?: number) {
    if (bufferMinutes === undefined) {
      return DEFAULT_BUFFER_MINUTES;
    }

    const normalizedBuffer = Number(bufferMinutes);

    if (!Number.isInteger(normalizedBuffer) || normalizedBuffer < 0 || normalizedBuffer > 120) {
      throw new BadRequestException('Buffer must be between 0 and 120 minutes.');
    }

    return normalizedBuffer;
  }

  private getRangeForView(date: Date, view: CalendarView) {
    const start = this.startOfDay(date);

    if (view === 'day') {
      const endInclusive = this.endOfDay(start);

      return {
        start,
        endInclusive,
        endExclusive: this.addDays(start, 1),
      };
    }

    if (view === 'week') {
      const endInclusive = this.endOfDay(this.addDays(start, 6));

      return {
        start,
        endInclusive,
        endExclusive: this.addDays(start, 7),
      };
    }

    const endInclusive = this.endOfMonth(start);

    return {
      start,
      endInclusive,
      endExclusive: this.addDays(endInclusive, 1),
    };
  }

  private buildDays(start: Date, endInclusive: Date) {
    const todayKey = this.formatDateKey(this.startOfDay(new Date()));
    const days: Array<{
      date: string;
      label: string;
      shortLabel: string;
      monthLabel: string;
      isToday: boolean;
    }> = [];

    for (
      let cursor = new Date(start);
      cursor <= endInclusive;
      cursor = this.addDays(cursor, 1)
    ) {
      days.push({
        date: this.formatDateKey(cursor),
        label: this.formatWeekdayLabel(cursor),
        shortLabel: this.formatShortWeekdayLabel(cursor),
        monthLabel: this.formatMonthLabel(cursor),
        isToday: this.formatDateKey(cursor) === todayKey,
      });
    }

    return days;
  }

  private serializeAppointment(
    appointment: Prisma.AppointmentGetPayload<{
      include: {
        customer: { select: { id: true; name: true } };
        user: { select: { id: true; name: true; photoUrl: true } };
        services: {
          include: {
            barbershopService: {
              select: { id: true; name: true; durationMinutes: true };
            };
          };
        };
      };
    }>,
  ) {
    const services = appointment.services.map(({ barbershopService }) => ({
      id: barbershopService.id,
      name: barbershopService.name,
      durationMinutes: barbershopService.durationMinutes,
    }));

    return {
      id: appointment.id,
      startDatetime: appointment.startDatetime.toISOString(),
      endDatetime: appointment.endDatetime.toISOString(),
      status: appointment.status,
      customer: appointment.customer,
      barber: appointment.user,
      services,
      serviceNames: services.map((service) => service.name),
      buffer: {
        startDatetime: appointment.endDatetime.toISOString(),
        endDatetime: new Date(
          appointment.endDatetime.getTime() +
            DEFAULT_BUFFER_MINUTES * 60 * 1000,
        ).toISOString(),
        durationMinutes: DEFAULT_BUFFER_MINUTES,
      },
    };
  }

  private serializeBlock(
    block: Prisma.BlockGetPayload<{
      include: {
        user: { select: { id: true; name: true } };
      };
    }>,
  ) {
    return {
      id: block.id,
      type: block.type,
      reason: block.reason,
      allDay: block.allDay,
      startDatetime: block.startDatetime.toISOString(),
      endDatetime: block.endDatetime.toISOString(),
      barber: block.user,
      label: this.getBlockLabel(block.type),
    };
  }

  private getBlockLabel(type: ScheduleBlockType) {
    switch (type) {
      case ScheduleBlockType.VACATION:
        return 'Ferias';
      case ScheduleBlockType.DAY_OFF:
        return 'Folga';
      case ScheduleBlockType.BREAK:
        return 'Pausa';
      case ScheduleBlockType.HOLIDAY:
        return 'Feriado';
      default:
        return 'Bloqueio';
    }
  }

  private startOfDay(date: Date) {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private endOfDay(date: Date) {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
  }

  private endOfMonth(date: Date) {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );
  }

  private addDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);
    return nextDate;
  }

  private formatDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private formatWeekdayLabel(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
    }).format(date);
  }

  private formatShortWeekdayLabel(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      timeZone: 'UTC',
    }).format(date);
  }

  private formatMonthLabel(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    }).format(date);
  }

  private formatBookingDateLabel(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
    }).format(date);
  }

  private async getEligibleBarbers(barbershopId: string, serviceId: string) {
    const explicitAssignments = await this.prismaService.barberService.findMany({
      where: {
        barbershopServiceId: serviceId,
        user: {
          barbershopId,
          active: true,
          role: { name: 'Barbeiro' },
        },
      },
      select: {
        userId: true,
      },
    });

    const assignedUserIds = explicitAssignments.map((assignment) => assignment.userId);

    return this.prismaService.user.findMany({
      where: {
        barbershopId,
        active: true,
        role: { name: 'Barbeiro' },
        ...(assignedUserIds.length > 0 ? { id: { in: assignedUserIds } } : {}),
      },
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
        name: true,
        specialty: true,
        photoUrl: true,
      },
    });
  }

  private async getAvailableTimesForDate(input: {
    barbershopId: string;
    date: Date;
    serviceDurationMinutes: number;
    eligibleBarbers: Array<{
      id: string;
      name: string;
      specialty: string | null;
      photoUrl: string | null;
    }>;
    workingDays: Array<{
      weekDay: number;
      openTime: string;
      closeTime: string;
      active: boolean;
      barbershopId: string;
      id: string;
    }>;
    availabilityByBarber: Array<{
      userId: string;
      weekDay: number;
      startTime: string;
      endTime: string;
      id: string;
    }>;
  }) {
    const weekday = input.date.getUTCDay();
    const baseWorkingDay =
      input.workingDays.find((workingDay) => workingDay.weekDay === weekday) ??
      this.getFallbackWorkingDay(weekday, input.barbershopId);

    if (!baseWorkingDay) {
      return [];
    }

    const candidateTimes = this.buildTimeSlots(
      baseWorkingDay.openTime,
      baseWorkingDay.closeTime,
      input.serviceDurationMinutes,
    );
    const availableTimes: Array<{ value: string; label: string }> = [];

    for (const time of candidateTimes) {
      const startDatetime = this.combineDateAndTime(input.date, time);
      const endDatetime = new Date(
        startDatetime.getTime() + input.serviceDurationMinutes * 60 * 1000,
      );
      const bufferedEndDatetime = new Date(
        endDatetime.getTime() + DEFAULT_BUFFER_MINUTES * 60 * 1000,
      );

      let hasAvailableBarber = false;

      for (const barber of input.eligibleBarbers) {
        const barberDayAvailability = input.availabilityByBarber.find(
          (availability) =>
            availability.userId === barber.id && availability.weekDay === weekday,
        );

        if (
          barberDayAvailability &&
          !this.timeFitsWindow(
            time,
            this.minutesToTime(
              this.timeToMinutes(time) + input.serviceDurationMinutes,
            ),
            barberDayAvailability.startTime,
            barberDayAvailability.endTime,
          )
        ) {
          continue;
        }

        const isAvailable = await this.isBarberAvailable({
          barbershopId: input.barbershopId,
          userId: barber.id,
          startDatetime,
          endDatetime,
          bufferedEndDatetime,
        });

        if (isAvailable) {
          hasAvailableBarber = true;
          break;
        }
      }

      if (hasAvailableBarber) {
        availableTimes.push({
          value: time,
          label: time,
        });
      }
    }

    return availableTimes;
  }

  private buildTimeSlots(
    openTime: string,
    closeTime: string,
    serviceDurationMinutes: number,
  ) {
    const startMinutes = this.timeToMinutes(openTime);
    const endMinutes = this.timeToMinutes(closeTime);
    const latestStart = endMinutes - serviceDurationMinutes;
    const slots: string[] = [];

    for (
      let currentMinutes = startMinutes;
      currentMinutes <= latestStart;
      currentMinutes += SLOT_INTERVAL_MINUTES
    ) {
      slots.push(this.minutesToTime(currentMinutes));
    }

    return slots;
  }

  private timeToMinutes(value: string) {
    const [hoursString = '0', minutesString = '0'] = value.split(':');
    return Number(hoursString) * 60 + Number(minutesString);
  }

  private minutesToTime(value: number) {
    const hours = Math.floor(value / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (value % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private combineDateAndTime(date: Date, time: string) {
    const [hoursString = '0', minutesString = '0'] = time.split(':');
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        Number(hoursString),
        Number(minutesString),
      ),
    );
  }

  private timeFitsWindow(
    startTime: string,
    endTime: string,
    windowStart: string,
    windowEnd: string,
  ) {
    return (
      this.timeToMinutes(startTime) >= this.timeToMinutes(windowStart) &&
      this.timeToMinutes(endTime) <= this.timeToMinutes(windowEnd)
    );
  }

  private getFallbackWorkingDay(weekday: number, barbershopId: string) {
    if (weekday === 0) {
      return null;
    }

    return {
      id: `fallback-${weekday}`,
      barbershopId,
      weekDay: weekday,
      openTime: '09:00',
      closeTime: '18:00',
      active: true,
    };
  }

  private async ensureBarberIsAvailable(input: {
    barbershopId: string;
    userId: string;
    startDatetime: Date;
    endDatetime: Date;
    bufferedEndDatetime: Date;
  }) {
    const isAvailable = await this.isBarberAvailable(input);

    if (!isAvailable) {
      throw new BadRequestException(
        'Barber already has an appointment or blocked period in this time range.',
      );
    }
  }

  private async isBarberAvailable(input: {
    barbershopId: string;
    userId: string;
    startDatetime: Date;
    endDatetime: Date;
    bufferedEndDatetime: Date;
  }) {
    const overlappingAppointment = await this.prismaService.appointment.findFirst({
      where: {
        barbershopId: input.barbershopId,
        userId: input.userId,
        status: {
          notIn: [AppointmentStatus.CANCELLED],
        },
        startDatetime: {
          lt: input.bufferedEndDatetime,
        },
      },
      orderBy: [{ startDatetime: 'asc' }],
    });

    if (overlappingAppointment) {
      const existingBufferedEnd = new Date(
        overlappingAppointment.endDatetime.getTime() +
          DEFAULT_BUFFER_MINUTES * 60 * 1000,
      );

      if (existingBufferedEnd > input.startDatetime) {
        return false;
      }
    }

    const overlappingBlock = await this.prismaService.block.findFirst({
      where: {
        userId: input.userId,
        startDatetime: { lt: input.endDatetime },
        endDatetime: { gt: input.startDatetime },
      },
    });

    if (overlappingBlock) {
      return false;
    }

    return true;
  }

  private async createInlineCustomer(input: {
    name?: string;
    phone?: string;
    email?: string | null;
  }) {
    if (!input.name) {
      throw new BadRequestException('Customer name is required.');
    }

    if (!input.phone) {
      throw new BadRequestException('Customer phone is required.');
    }

    return this.prismaService.customer.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        firstAccess: true,
        active: true,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
