import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"

import { CustomerModule } from "../customer/customer.module"
import { CustomerAuthController } from "./customer-auth.controller"
import { CustomerAuthService } from "./customer-auth.service"
import { CustomerJwtStrategy } from "./strategies/customer-jwt.strategy"
import { CustomerRefreshStrategy } from "./strategies/customer-refresh.strategy"

@Module({
  imports: [CustomerModule, PassportModule, JwtModule.register({})],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtStrategy,
    CustomerRefreshStrategy,
  ],
})
export class CustomerAuthModule {}
