import { Module } from '@nestjs/common';
import { BarbershopServiceService } from './barbershop-service.service';
import { BarbershopServiceController } from './barbershop-service.controller';

@Module({
  controllers: [BarbershopServiceController],
  providers: [BarbershopServiceService],
})
export class BarbershopServiceModule {}
