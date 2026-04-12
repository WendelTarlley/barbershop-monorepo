import { CreateUserDto, UpdateUserDto, CreateOwnerUserDto } from '@barbershop/shared';
import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
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
            create: allPermissions.map(permission => ({
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
