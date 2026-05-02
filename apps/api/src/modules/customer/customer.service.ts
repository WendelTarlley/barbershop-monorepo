import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Prisma } from "@barbershop/database"
import * as argon2 from "argon2"

import {
  CreateCustomerDto,
  CustomerProfileDto,
} from "@barbershop/shared"

import { PrismaService } from "src/prisma/prisma.service"
import { UpdateCustomerDto } from "./dto/update-customer.dto"

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const data = await this.buildCreatePayload(createCustomerDto)

    try {
      const customer = await this.prisma.customer.create({ data })
      return this.toProfile(customer)
    } catch (error) {
      this.handleUniqueConstraintError(error)
      throw error
    }
  }

  async findAll() {
    const customers = await this.prisma.customer.findMany({
      orderBy: [{ createdAt: "desc" }],
    })

    return customers.map((customer) => this.toProfile(customer))
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: this.requireId(id) },
    })

    if (!customer) {
      throw new NotFoundException("Customer not found.")
    }

    return this.toProfile(customer)
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const existingCustomer = await this.findExistingCustomerOrThrow(id)
    const data = await this.buildUpdatePayload(updateCustomerDto, existingCustomer)

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        "At least one field must be provided for update.",
      )
    }

    try {
      const customer = await this.prisma.customer.update({
        where: { id: id.trim() },
        data,
      })

      return this.toProfile(customer)
    } catch (error) {
      this.handleUniqueConstraintError(error)
      throw error
    }
  }

  async remove(id: string) {
    await this.findExistingCustomerOrThrow(id)

    const customer = await this.prisma.customer.delete({
      where: { id: id.trim() },
    })

    return this.toProfile(customer)
  }

  async findByEmail(email: string) {
    const normalizedEmail = this.normalizeOptionalEmail(email)

    if (!normalizedEmail) {
      throw new BadRequestException("Email is required.")
    }

    return this.prisma.customer.findUnique({
      where: { email: normalizedEmail },
    })
  }

  async findById(id: string) {
    return this.prisma.customer.findUnique({
      where: { id: this.requireId(id) },
    })
  }

  async createFromAuth(createCustomerDto: CreateCustomerDto) {
    const customer = await this.create(createCustomerDto)
    return this.prisma.customer.findUniqueOrThrow({ where: { id: customer.id } })
  }

  toProfile(customer: {
    id: string
    name: string
    phone: string
    email: string | null
    firstAccess: boolean
    active: boolean
    createdAt: Date
    updatedAt: Date
  }): CustomerProfileDto {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      firstAccess: customer.firstAccess,
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }
  }

  private async buildCreatePayload(createCustomerDto: CreateCustomerDto) {
    const name = this.normalizeRequiredText(createCustomerDto.name, "Name")
    const phone = this.normalizeRequiredText(createCustomerDto.phone, "Phone")
    const email = this.normalizeOptionalEmail(createCustomerDto.email)
    const password = createCustomerDto.password?.trim()

    if (password && !email) {
      throw new BadRequestException(
        "Email is required when defining a password.",
      )
    }

    return {
      name,
      phone,
      email,
      passwordHash: password ? await argon2.hash(password) : null,
      firstAccess: password ? false : true,
      active: true,
    }
  }

  private async buildUpdatePayload(
    updateCustomerDto: UpdateCustomerDto,
    existingCustomer: { email: string | null },
  ) {
    const data: {
      name?: string
      phone?: string
      email?: string | null
      passwordHash?: string | null
      firstAccess?: boolean
      active?: boolean
    } = {}

    if (updateCustomerDto.name !== undefined) {
      data.name = this.normalizeRequiredText(updateCustomerDto.name, "Name")
    }

    if (updateCustomerDto.phone !== undefined) {
      data.phone = this.normalizeRequiredText(updateCustomerDto.phone, "Phone")
    }

    if (updateCustomerDto.email !== undefined) {
      data.email = this.normalizeOptionalEmail(updateCustomerDto.email)
    }

    if (updateCustomerDto.password !== undefined) {
      const normalizedPassword = updateCustomerDto.password.trim()

      if (!normalizedPassword) {
        data.passwordHash = null
        data.firstAccess = true
      } else {
        const nextEmail =
          data.email !== undefined ? data.email : existingCustomer.email

        if (!nextEmail) {
          throw new BadRequestException(
            "Email is required when defining a password.",
          )
        }

        data.passwordHash = await argon2.hash(normalizedPassword)
        data.firstAccess = false
      }
    }

    if (updateCustomerDto.active !== undefined) {
      data.active = updateCustomerDto.active
    }

    return data
  }

  private async findExistingCustomerOrThrow(id: string) {
    const customer = await this.findById(id)

    if (!customer) {
      throw new NotFoundException("Customer not found.")
    }

    return customer
  }

  private normalizeRequiredText(value: string | undefined, label: string) {
    const normalized = value?.trim()

    if (!normalized) {
      throw new BadRequestException(`${label} is required.`)
    }

    return normalized
  }

  private normalizeOptionalEmail(value?: string | null) {
    const normalized = value?.trim().toLowerCase()
    return normalized ? normalized : null
  }

  private requireId(id: string) {
    const normalizedId = id?.trim()

    if (!normalizedId) {
      throw new BadRequestException("Customer id is required.")
    }

    return normalizedId
  }

  private handleUniqueConstraintError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = Array.isArray(error.meta?.target) ? error.meta.target : []

      if (target.includes("email")) {
        throw new ConflictException("A customer with this email already exists.")
      }
    }
  }
}
