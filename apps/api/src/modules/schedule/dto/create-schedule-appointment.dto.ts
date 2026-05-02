export class CreateScheduleAppointmentDto {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  userId!: string;
  serviceIds!: string[];
  startDatetime!: string;
  bufferMinutes?: number;
}
