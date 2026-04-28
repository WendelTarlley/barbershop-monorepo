import { BadRequestException, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import {
  BARBERSHOP_CLS_KEY,
  BARBERSHOP_HEADER,
} from './barbershop-context.constants';

@Injectable()
export class BarbershopContextService {
  constructor(private readonly cls: ClsService) {}

  getBarbershopId() {
    return this.cls.get<string>(BARBERSHOP_CLS_KEY);
  }

  getRequiredBarbershopId() {
    const barbershopId = this.getBarbershopId();

    if (!barbershopId) {
      throw new BadRequestException(`Header ${BARBERSHOP_HEADER} is required.`);
    }

    return barbershopId;
  }
}
