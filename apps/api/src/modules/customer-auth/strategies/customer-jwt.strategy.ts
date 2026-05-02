import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import { PrismaService } from "src/prisma/prisma.service"

export type CustomerJwtPayload = {
  sub: string
  email: string
  firstAccess: boolean
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  "customer-jwt",
) {
  constructor(private readonly prisma: PrismaService) {
    const accessTokenSecret =
      process.env.CUSTOMER_ACCESS_TOKEN_SECRET ??
      process.env.ACCESS_TOKEN_SECRET

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessTokenSecret,
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
