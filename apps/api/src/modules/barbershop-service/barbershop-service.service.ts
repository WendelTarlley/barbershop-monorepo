import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBarbershopServiceDto } from './dto/create-barbershop-service.dto';
import { UpdateBarbershopServiceDto } from './dto/update-barbershop-service.dto';
import { BarbershopService as BarbershopServiceModel } from '@barbershop/database';

import { BarbershopContextService } from '../../common/barbershop-context/barbershop-context.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BarbershopServiceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly barbershopContext: BarbershopContextService,
  ) {}

  async create(createBarbershopServiceDto: CreateBarbershopServiceDto) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();

    const createdService = await this.prismaService.barbershopService.create({
      data: {
        name: this.validateName(createBarbershopServiceDto.name),
        description:
          createBarbershopServiceDto.description?.trim() || null,
        durationMinutes: this.validateDuration(
          createBarbershopServiceDto.durationMinutes,
        ),
        price: this.validatePrice(createBarbershopServiceDto.price),
        active: createBarbershopServiceDto.active ?? true,
        barbershopId,
      },
    });

    return this.serialize(createdService);
  }

  async findAll() {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    return this.findAllByBarbershopId(barbershopId);
  }

  async findAllByBarbershopId(barbershopId: string) {
    if (!barbershopId?.trim()) {
      throw new BadRequestException('Barbershop id is required.');
    }

    const services = await this.prismaService.barbershopService.findMany({
      where: {
        barbershopId: barbershopId.trim(),
      },
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });

    return services.map((service) => this.serialize(service));
  }

  async findOne(id: string) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();
    const service = await this.getScopedServiceOrThrow(id, barbershopId);

    return this.serialize(service);
  }

  async update(
    id: string,
    updateBarbershopServiceDto: UpdateBarbershopServiceDto,
  ) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();

    await this.getScopedServiceOrThrow(id, barbershopId);

    const updatedService = await this.prismaService.barbershopService.update({
      where: { id },
      data: this.buildUpdatePayload(updateBarbershopServiceDto),
    });

    return this.serialize(updatedService);
  }

  async remove(id: string) {
    const barbershopId = this.barbershopContext.getRequiredBarbershopId();

    await this.getScopedServiceOrThrow(id, barbershopId);

    const deletedService = await this.prismaService.barbershopService.delete({
      where: { id },
    });

    return this.serialize(deletedService);
  }

  private async getScopedServiceOrThrow(id: string, barbershopId: string) {
    if (!id?.trim()) {
      throw new BadRequestException('Service id is required.');
    }

    const service = await this.prismaService.barbershopService.findFirst({
      where: {
        id: id.trim(),
        barbershopId,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    return service;
  }

  private buildUpdatePayload(
    updateBarbershopServiceDto: UpdateBarbershopServiceDto,
  ) {
    const payload: {
      name?: string;
      description?: string | null;
      durationMinutes?: number;
      price?: number;
      active?: boolean;
    } = {};

    if (updateBarbershopServiceDto.name !== undefined) {
      payload.name = this.validateName(updateBarbershopServiceDto.name);
    }

    if (updateBarbershopServiceDto.description !== undefined) {
      payload.description =
        updateBarbershopServiceDto.description?.trim() || null;
    }

    if (updateBarbershopServiceDto.durationMinutes !== undefined) {
      payload.durationMinutes = this.validateDuration(
        updateBarbershopServiceDto.durationMinutes,
      );
    }

    if (updateBarbershopServiceDto.price !== undefined) {
      payload.price = this.validatePrice(updateBarbershopServiceDto.price);
    }

    if (updateBarbershopServiceDto.active !== undefined) {
      payload.active = updateBarbershopServiceDto.active;
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update.',
      );
    }

    return payload;
  }

  private validateName(name?: string) {
    const normalizedName = name?.trim();

    if (!normalizedName) {
      throw new BadRequestException('Name is required.');
    }

    return normalizedName;
  }

  private validateDuration(durationMinutes?: number) {
    const normalizedDuration = Number(durationMinutes);

    if (
      !Number.isInteger(normalizedDuration) ||
      normalizedDuration <= 0
    ) {
      throw new BadRequestException('Duration must be a positive integer.');
    }

    return normalizedDuration;
  }

  private validatePrice(price?: number) {
    const normalizedPrice = Number(price);

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new BadRequestException('Price must be zero or greater.');
    }

    return normalizedPrice;
  }

  private serialize(service: BarbershopServiceModel) {
    return {
      ...service,
      price: Number(service.price),
    };
  }
}
