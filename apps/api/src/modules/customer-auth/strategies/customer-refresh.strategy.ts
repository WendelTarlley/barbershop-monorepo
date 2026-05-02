import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import { PrismaService } from "src/prisma/prisma.service"
import { CustomerJwtPayload } from "./customer-jwt.strategy"

@Injectable()
export class CustomerRefreshStrategy extends PassportStrategy(
  Strategy,
  "customer-jwt-refresh",
) {
  constructor(private readonly prisma: PrismaService) {
    const refreshTokenSecret =
      process.env.CUSTOMER_REFRESH_TOKEN_SECRET ??
      process.env.REFRESH_TOKEN_SECRET

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshTokenSecret,
    })
  }

  async validate(payload: CustomerJwtPayload) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    })

    if (!customer || !customer.active) {
      throw new UnauthorizedException()
    }

    return customer
  }
}
