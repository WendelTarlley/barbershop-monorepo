// auth/auth.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards, Request } from "@nestjs/common"
import type { Request as ExpressRequest } from "express"
import { ThrottlerGuard } from "@nestjs/throttler"
import { AuthService } from "./auth.service"

import { RefreshGuard } from "./guards/refresh.guard"
import {
  CheckEmailDto,
  DefinePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
} from "@barbershop/shared"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("check-email")
  checkEmail(@Body() dto: CheckEmailDto) {
    return this.authService.checkEmail(dto)
  }

  @Get("verify-magic-link")
  verifyMagicLink(@Query("token") token: string) {
    return this.authService.verifyMagicLink(token)
  }

  @Post("define-password")
  definePassword(@Body() dto: DefinePasswordDto) {
    return this.authService.definePassword(dto)
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Get("verify-reset-password")
  verifyResetPassword(@Query("token") token: string) {
    return this.authService.verifyResetPassword(token)
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @UseGuards(ThrottlerGuard)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @UseGuards(RefreshGuard)
  @Post("refresh")
  refresh(@Request() req: ExpressRequest & { user: { id: string } }) {
    return this.authService.refresh(req.user.id)
  }
}
