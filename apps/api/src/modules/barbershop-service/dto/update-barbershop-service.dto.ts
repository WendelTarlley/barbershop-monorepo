import { PartialType } from '@nestjs/mapped-types';
import { CreateBarbershopServiceDto } from './create-barbershop-service.dto';

export class UpdateBarbershopServiceDto extends PartialType(CreateBarbershopServiceDto) {}
