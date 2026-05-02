import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common"
import { Throttle, ThrottlerGuard } from "@nestjs/throttler"

import {
  CreateCustomerDto,
  LoginCustomerDto,
} from "@barbershop/shared"

import { CustomerAuthService } from "./customer-auth.service"
import { CustomerJwtGuard } from "./guards/customer-jwt.guard"
import { CustomerRefreshGuard } from "./guards/customer-refresh.guard"

@Controller("customer-auth")
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post("register")
  register(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerAuthService.register(createCustomerDto)
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 3, ttl: 1000 } })
  @Post("login")
  login(@Body() loginCustomerDto: LoginCustomerDto) {
    return this.customerAuthService.login(loginCustomerDto)
  }

  @UseGuards(CustomerRefreshGuard)
  @Post("refresh")
  refresh(@Request() req) {
    return this.customerAuthService.refresh(req.user.id)
  }

  @UseGuards(CustomerJwtGuard)
  @Get("me")
  me(@Request() req) {
    return this.customerAuthService.getProfile(req.user.id)
  }
}
