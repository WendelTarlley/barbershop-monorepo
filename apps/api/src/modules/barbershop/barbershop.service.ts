import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBarbershopDto } from "@barbershop/shared";
@Injectable()
export class BarbershopService {
      constructor(private prismaService: PrismaService) { }

    async getBarbershops() {
        return this.prismaService.barbershop.findMany();
    }

    async create(data: CreateBarbershopDto) {
        const allPermissions = await this.prismaService.permission.findMany();


        return this.prismaService.barbershop.create({
            data
        });
    }

    findOne(id: string) {
      const barbershop = this.prismaService.barbershop.findUnique({ where: { id },
        include: {users: true,services: true} });

        if (!barbershop) {
            throw new NotFoundException('Barbershop not found');
        }
      return barbershop;
    }


    async getBarbershopByName(barbershopName: string) {
        return this.prismaService.barbershop.findMany({
            where: {
                name: {
                    contains: barbershopName,
                    mode: 'insensitive'
                }
            },
            include: {
                users: true,
                services: true
            }
        });
    }
}
