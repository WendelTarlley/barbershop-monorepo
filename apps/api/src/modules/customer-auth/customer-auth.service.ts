import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as argon2 from "argon2"

import {
  CreateCustomerDto,
  LoginCustomerDto,
} from "@barbershop/shared"

import { CustomerService } from "../customer/customer.service"

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createCustomerDto: CreateCustomerDto) {
    if (!createCustomerDto.email?.trim()) {
      throw new BadRequestException("Email is required for customer registration.")
    }

    if (!createCustomerDto.password?.trim()) {
      throw new BadRequestException(
        "Password is required for customer registration.",
      )
    }

    const customer = await this.customerService.createFromAuth(createCustomerDto)
    return this.generateTokens(customer)
  }

  async login(loginCustomerDto: LoginCustomerDto) {
    const customer = await this.customerService.findByEmail(loginCustomerDto.email)

    if (!customer || !customer.active || !customer.passwordHash) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const passwordMatches = await argon2.verify(
      customer.passwordHash,
      loginCustomerDto.password,
    )

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials")
    }

    return this.generateTokens(customer)
  }

  async refresh(customerId: string) {
    const customer = await this.customerService.findById(customerId)

    if (!customer || !customer.active) {
      throw new UnauthorizedException()
    }

    return this.generateTokens(customer)
  }

  async getProfile(customerId: string) {
    const customer = await this.customerService.findById(customerId)

    if (!customer || !customer.active) {
      throw new UnauthorizedException()
    }

    return this.customerService.toProfile(customer)
  }

  private getAccessTokenSecret() {
    return (
      process.env.CUSTOMER_ACCESS_TOKEN_SECRET ??
      process.env.ACCESS_TOKEN_SECRET
    )
  }

  private getRefreshTokenSecret() {
    return (
      process.env.CUSTOMER_REFRESH_TOKEN_SECRET ??
      process.env.REFRESH_TOKEN_SECRET
    )
  }

  private async generateTokens(customer: {
    id: string
    email: string | null
    firstAccess: boolean
  }) {
    if (!customer.email) {
      throw new BadRequestException(
        "Customer must have an email to receive authentication tokens.",
      )
    }

    const payload = {
      sub: customer.id,
      email: customer.email,
      firstAccess: customer.firstAccess,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getAccessTokenSecret(),
        expiresIn: "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getRefreshTokenSecret(),
        expiresIn: "7d",
      }),
    ])

    return { accessToken, refreshToken }
  }
}
