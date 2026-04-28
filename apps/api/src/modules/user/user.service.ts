import {
  CreateUserDto,
  UpdateUserDto,
  CreateOwnerUserDto,
} from '@barbershop/shared';
import { Prisma } from '@barbershop/database';
import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { BarbershopContextService } from '../../common/barbershop-context/barbershop-context.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private readonly barbershopContext: BarbershopContextService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    const name = createUserDto.name?.trim();
    const email = createUserDto.email?.trim().toLowerCase();
    const specialty = createUserDto.specialty?.trim();
    const cpf = createUserDto.cpf?.trim() || `pending-${randomUUID()}`;

    if (!name) {
      throw new BadRequestException('Name is required.');
    }

    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    if (!createUserDto.roleId) {
      throw new BadRequestException('Role is required.');
    }

    const role = await this.prismaService.role.findFirst({
      where: {
        id: createUserDto.roleId,
        barbershopId,
      },
    });

    if (!role) {
      throw new BadRequestException('Role not found for this barbershop.');
    }

    try {
      return await this.prismaService.user.create({
        data: {
          name,
          email,
          cpf,
          firstAccess: true,
          active: createUserDto.active ?? true,
          photoUrl: createUserDto.photoUrl?.trim() || null,
          specialty: specialty || null,
          barbershopId,
          roleId: createUserDto.roleId,
        },
        include: {
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target
          : [];

        if (target.includes('email')) {
          throw new ConflictException('A user with this email already exists.');
        }

        if (target.includes('cpf')) {
          throw new ConflictException(
            'Could not generate a unique temporary CPF.',
          );
        }
      }

      throw error;
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: String) {
    return `This action returns a #${id} user`;
  }

  update(id: String, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: String) {
    return `This action removes a #${id} user`;
  }

  getUserBarberType() {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();

    return this.prismaService.user.findMany({
      where: {
        barbershopId,
        role: { name: 'Barbeiro' },
      },
    });
  }

  async createOwner(createOwnerUserDto: CreateOwnerUserDto) {
    const allPermissions = await this.prismaService.permission.findMany();

    return await this.prismaService.$transaction(async (tx) => {
      const ownerRole = await tx.role.create({
        data: {
          name: 'Owner',
          description: 'Role for barbershop owners',
          isSystem: true,
          barbershopId: createOwnerUserDto.barbershopId,
          permissions: {
            create: allPermissions.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        },
      });

      const user = await tx.user.create({
        data: {
          name: createOwnerUserDto.name,
          cpf: createOwnerUserDto.cpf,
          email: createOwnerUserDto.email,
          firstAccess: true,
          barbershopId: createOwnerUserDto.barbershopId,
          roleId: ownerRole.id,
        },
      });
      return user;
    });
  }
}
