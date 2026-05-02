import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { CreateScheduleAppointmentDto } from './dto/create-schedule-appointment.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findCalendar(@Query('view') view?: string, @Query('date') date?: string) {
    return this.scheduleService.getCalendar({
      view,
      date,
    });
  }

  @Get('availability')
  findAvailability(
    @Query('serviceId') serviceId?: string,
    @Query('startDatetime') startDatetime?: string,
  ) {
    return this.scheduleService.getAvailability({
      serviceId,
      startDatetime,
    });
  }

  @Get('booking-options')
  findBookingOptions(
    @Query('serviceId') serviceId?: string,
    @Query('date') date?: string,
  ) {
    return this.scheduleService.getBookingOptions({
      serviceId,
      date,
    });
  }

  @Post('appointments')
  createAppointment(@Body() createScheduleAppointmentDto: CreateScheduleAppointmentDto) {
    return this.scheduleService.createAppointment(createScheduleAppointmentDto);
  }
}
