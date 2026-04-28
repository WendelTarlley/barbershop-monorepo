// auth/auth.module.ts
import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { RefreshStrategy } from "./strategies/refresh.strategy"
import { MailModule } from "../mail/mail.module"
import { PrismaModule } from "src/prisma/prisma.module"

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({}),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
})
export class AuthModule {}