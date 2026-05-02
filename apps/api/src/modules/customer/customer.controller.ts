import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common"
import { CreateCustomerDto } from "@barbershop/shared"

import { CustomerService } from "./customer.service"
import { UpdateCustomerDto } from "./dto/update-customer.dto"

@Controller("customers")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto)
  }

  @Get()
  findAll() {
    return this.customerService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customerService.findOne(id)
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.customerService.remove(id)
  }
}
