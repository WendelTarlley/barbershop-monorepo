// auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { MailService } from "../mail/mail.service"
import * as argon2 from "argon2"
import * as crypto from "crypto"
import { CheckEmailDto, DefinePasswordDto, LoginDto } from "@barbershop/shared"
import { PrismaService } from "src/prisma/prisma.service"
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  // ─── Passo 1: verifica email ─────────────────────────

  async checkEmail({ email }: CheckEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    // sempre responde igual para evitar enumeração de usuários
    const response = { firstAccess: false }

    if (!user || !user.active) {
      return response
    }

    if (user.firstAccess) {
      await this.sendMagicLink(user)
      return { firstAccess: true }
    }

    return { firstAccess: false }
  }

  // ─── Passo 2a: valida magic link + define senha ───────

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

    // marca como usado
    await this.prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    })

    // retorna token temporário para a tela de definir senha
    const tempToken = await this.jwt.signAsync(
      { sub: magicLink.user.id, type: "define-password" },
      { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: "10m" },
    )

    return { tempToken }
  }

  async definePassword({ token, password }: DefinePasswordDto) {
    // valida o token temporário
    let payload: { sub: string; type: string }

    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
    } catch {
      throw new UnauthorizedException("Invalid or expired token")
    }

    if (payload.type !== "define-password") {
      throw new UnauthorizedException("Invalid token type")
    }

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

  // ─── Passo 2b: login normal ───────────────────────────

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

  // ─── Refresh ──────────────────────────────────────────

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    return this.generateTokens(user)
  }

  // ─── Helpers ──────────────────────────────────────────

  private async sendMagicLink(user: { id: string; name: string; email: string }) {
    // invalida magic links anteriores do usuário
    await this.prisma.magicLink.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

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

  private async generateTokens(user: { id: string; email: string; barbershopId: string; roleId: string; firstAccess: boolean }) {
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
