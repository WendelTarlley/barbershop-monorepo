import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import { BarbershopContextService } from 'src/common/barbershop-context/barbershop-context.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly barbershopContext: BarbershopContextService,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  findAll() {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    return this.prisma.role.findMany({
      where: { barbershopId, isSystem: false },
      include: { permissions: true },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

  findByBarbershop() {}
}
