import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BarbershopService } from './barbershop.service';
import { CreateBarbershopDto } from '@barbershop/shared';

@Controller('barbershop')
export class BarbershopController {
      constructor(private readonly barbershopService: BarbershopService) {}

    @Get()
    findAll() {
        return this.barbershopService.getBarbershops();
    }

    @Post()
    create(@Body() data: CreateBarbershopDto) {
        return this.barbershopService.create(data);
    }

    @Get() 
    findOne(@Query('barbershopName') barbershopName: string) {
        return this.barbershopService.getBarbershopByName(barbershopName);
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.barbershopService.findOne(id);
    }
  }