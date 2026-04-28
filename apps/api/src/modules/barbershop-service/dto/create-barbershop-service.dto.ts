export class CreateBarbershopServiceDto {
  name!: string;
  description?: string;
  durationMinutes!: number;
  price!: number;
  active?: boolean;
}
