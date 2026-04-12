import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BarbershopServiceService } from './barbershop-service.service';
import { CreateBarbershopServiceDto } from './dto/create-barbershop-service.dto';
import { UpdateBarbershopServiceDto } from './dto/update-barbershop-service.dto';

@Controller('barbershop-service')
export class BarbershopServiceController {
  constructor(private readonly barbershopServiceService: BarbershopServiceService) {}

  @Post()
  create(@Body() createBarbershopServiceDto: CreateBarbershopServiceDto) {
    return this.barbershopServiceService.create(createBarbershopServiceDto);
  }

  @Get()
  findAll() {
    return this.barbershopServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barbershopServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBarbershopServiceDto: UpdateBarbershopServiceDto) {
    return this.barbershopServiceService.update(+id, updateBarbershopServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barbershopServiceService.remove(+id);
  }
}
