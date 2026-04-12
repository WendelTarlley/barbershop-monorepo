import { Injectable } from '@nestjs/common';
import { CreateBarbershopServiceDto } from './dto/create-barbershop-service.dto';
import { UpdateBarbershopServiceDto } from './dto/update-barbershop-service.dto';

@Injectable()
export class BarbershopServiceService {
  create(createBarbershopServiceDto: CreateBarbershopServiceDto) {
    return 'This action adds a new barbershopService';
  }

  findAll() {
    return `This action returns all barbershopService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} barbershopService`;
  }

  update(id: number, updateBarbershopServiceDto: UpdateBarbershopServiceDto) {
    return `This action updates a #${id} barbershopService`;
  }

  remove(id: number) {
    return `This action removes a #${id} barbershopService`;
  }
}
