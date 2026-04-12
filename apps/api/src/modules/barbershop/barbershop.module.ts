import { Module } from '@nestjs/common';
import { BarbershopService } from './barbershop.service';
import { BarbershopController } from './barbershop.controller';

@Module({
  controllers: [BarbershopController],
  providers: [BarbershopService],
})
export class BarbershopModule {}
