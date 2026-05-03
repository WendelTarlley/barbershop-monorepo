// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { Request } from "express"
import { PrismaService } from "src/prisma/prisma.service"

export type JwtPayload = {
  email: string
  barbershopId: string
  roleId: string
  firstAccess: boolean
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private prisma: PrismaService) {
    const jwtFromRequest = ((ExtractJwt as unknown) as {
      fromAuthHeaderAsBearerToken: () => (req: Request) => string | null
    }).fromAuthHeaderAsBearerToken()

    super({
      jwtFromRequest,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
        permissions: { include: { permission: true } },
      },
    })

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    return user
  }
}
