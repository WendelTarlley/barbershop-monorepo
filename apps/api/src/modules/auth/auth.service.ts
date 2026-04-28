import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as argon2 from "argon2"
import * as crypto from "crypto"

import {
  CheckEmailDto,
  DefinePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
} from "@barbershop/shared"

import { PrismaService } from "src/prisma/prisma.service"
import { MailService } from "../mail/mail.service"

type PasswordTokenType = "define-password" | "reset-password"
type PasswordTokenPayload = { sub: string; type: PasswordTokenType }
type AuthUser = {
  id: string
  name: string
  email: string
  active: boolean
  firstAccess: boolean
  barbershopId: string
  roleId: string
  password: string | null
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async checkEmail({ email }: CheckEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    const response = { firstAccess: false }

    if (!user || !user.active) {
      return response
    }

    if (user.firstAccess) {
      await this.sendMagicLink(user)
      return { firstAccess: true }
    }

    return response
  }

  async verifyMagicLink(token: string) {
    const magicLink = await this.prisma.magicLink.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!magicLink) {
      throw new UnauthorizedException("Invalid link")
    }

    if (magicLink.usedAt) {
      throw new UnauthorizedException("Link already used")
    }

    if (magicLink.expiresAt < new Date()) {
      throw new UnauthorizedException("Link expired")
    }

    await this.prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    })

    return {
      tempToken: await this.issueTemporaryPasswordToken(
        magicLink.user.id,
        "define-password",
      ),
    }
  }

  async definePassword({ token, password }: DefinePasswordDto) {
    const payload = await this.verifyTemporaryPasswordToken(
      token,
      "define-password",
    )
    const hashed = await argon2.hash(password)

    const user = await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        password: hashed,
        firstAccess: false,
      },
    })

    return this.generateTokens(user)
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) {
      return { success: true }
    }

    if (user.firstAccess) {
      await this.sendMagicLink(user)
      return { success: true }
    }

    await this.sendPasswordResetLink(user)

    return { success: true }
  }

  async verifyResetPassword(token: string) {
    const passwordResetLink = await this.prisma.magicLink.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!passwordResetLink) {
      throw new UnauthorizedException("Invalid link")
    }

    if (passwordResetLink.usedAt) {
      throw new UnauthorizedException("Link already used")
    }

    if (passwordResetLink.expiresAt < new Date()) {
      throw new UnauthorizedException("Link expired")
    }

    await this.prisma.magicLink.update({
      where: { id: passwordResetLink.id },
      data: { usedAt: new Date() },
    })

    return {
      tempToken: await this.issueTemporaryPasswordToken(
        passwordResetLink.user.id,
        "reset-password",
      ),
    }
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const payload = await this.verifyTemporaryPasswordToken(
      token,
      "reset-password",
    )
    const hashed = await argon2.hash(password)

    const user = await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        password: hashed,
      },
    })

    return this.generateTokens(user)
  }

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user || !user.active) {
      throw new UnauthorizedException("Invalid credentials")
    }

    if (user.firstAccess) {
      throw new BadRequestException("First access, check your email")
    }

    const passwordMatch = await argon2.verify(user.password!, password)

    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid credentials")
    }

    return this.generateTokens(user)
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    return this.generateTokens(user)
  }

  private async sendMagicLink(user: Pick<AuthUser, "id" | "name" | "email">) {
    await this.prisma.magicLink.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await this.prisma.magicLink.create({
      data: { token, expiresAt, userId: user.id },
    })

    const link = `${process.env.APP_URL}/auth/magic-link?token=${token}`

    await this.mail.sendMagicLink({
      to: user.email,
      name: user.name,
      link,
    })
  }

  private async sendPasswordResetLink(
    user: Pick<AuthUser, "id" | "name" | "email">,
  ) {
    await this.prisma.magicLink.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await this.prisma.magicLink.create({
      data: { token, expiresAt, userId: user.id },
    })

    const link = `${process.env.APP_URL}/auth/reset-password?token=${token}`

    await this.mail.sendPasswordResetLink({
      to: user.email,
      name: user.name,
      link,
    })
  }

  private async issueTemporaryPasswordToken(
    userId: string,
    type: PasswordTokenType,
  ) {
    return this.jwt.signAsync(
      { sub: userId, type },
      { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: "10m" },
    )
  }

  private async verifyTemporaryPasswordToken(
    token: string,
    expectedType: PasswordTokenType,
  ): Promise<PasswordTokenPayload> {
    let payload: PasswordTokenPayload

    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
    } catch {
      throw new UnauthorizedException("Invalid or expired token")
    }

    if (payload.type !== expectedType) {
      throw new UnauthorizedException("Invalid token type")
    }

    return payload
  }

  private async generateTokens(
    user: Pick<
      AuthUser,
      "id" | "email" | "barbershopId" | "roleId" | "firstAccess"
    >,
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      barbershopId: user.barbershopId,
      roleId: user.roleId,
      firstAccess: user.firstAccess,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: "15m",
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: "7d",
      }),
    ])

    return { accessToken, refreshToken }
  }
}
