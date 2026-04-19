import { Global, Module } from '@nestjs/common';

import { BarbershopContextService } from './barbershop-context.service';

@Global()
@Module({
  providers: [BarbershopContextService],
  exports: [BarbershopContextService],
})
export class BarbershopContextModule {}
