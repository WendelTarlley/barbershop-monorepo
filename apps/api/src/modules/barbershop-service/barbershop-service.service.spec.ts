import { Test, TestingModule } from '@nestjs/testing';
import { BarbershopServiceService } from './barbershop-service.service';
import { Prisma } from '@barbershop/database';

import { BarbershopContextService } from '../../common/barbershop-context/barbershop-context.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BarbershopServiceService', () => {
  let service: BarbershopServiceService;
  const prismaMock = {
    barbershopService: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const barbershopContextMock = {
    getRequiredBarbershopId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarbershopServiceService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: BarbershopContextService,
          useValue: barbershopContextMock,
        },
      ],
    }).compile();

    service = module.get<BarbershopServiceService>(BarbershopServiceService);
    jest.clearAllMocks();
    barbershopContextMock.getRequiredBarbershopId.mockReturnValue('shop-1');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a service using the current barbershop context', async () => {
    prismaMock.barbershopService.create.mockResolvedValue({
      id: 'service-1',
      name: 'Corte',
      description: null,
      durationMinutes: 30,
      price: new Prisma.Decimal('45.50'),
      active: true,
      barbershopId: 'shop-1',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    });

    const result = await service.create({
      name: '  Corte  ',
      durationMinutes: 30,
      price: 45.5,
    });

    expect(prismaMock.barbershopService.create).toHaveBeenCalledWith({
      data: {
        name: 'Corte',
        description: null,
        durationMinutes: 30,
        price: 45.5,
        active: true,
        barbershopId: 'shop-1',
      },
    });
    expect(result.price).toBe(45.5);
  });

  it('lists all services from a specific barbershop', async () => {
    prismaMock.barbershopService.findMany.mockResolvedValue([
      {
        id: 'service-1',
        name: 'Barba',
        description: null,
        durationMinutes: 25,
        price: new Prisma.Decimal('30.00'),
        active: true,
        barbershopId: 'shop-1',
        createdAt: new Date('2026-04-19T10:00:00.000Z'),
        updatedAt: new Date('2026-04-19T10:00:00.000Z'),
      },
    ]);

    const result = await service.findAll();

    expect(prismaMock.barbershopService.findMany).toHaveBeenCalledWith({
      where: { barbershopId: 'shop-1' },
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: 'service-1',
        price: 30,
      }),
    ]);
  });

  it('returns one service only when it belongs to the current barbershop', async () => {
    prismaMock.barbershopService.findFirst.mockResolvedValue({
      id: 'service-1',
      name: 'Corte e barba',
      description: null,
      durationMinutes: 60,
      price: new Prisma.Decimal('70.00'),
      active: true,
      barbershopId: 'shop-1',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    });

    const result = await service.findOne('service-1');

    expect(prismaMock.barbershopService.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'service-1',
        barbershopId: 'shop-1',
      },
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: 'service-1',
        price: 70,
      }),
    );
  });

  it('updates only the provided service fields', async () => {
    prismaMock.barbershopService.findFirst.mockResolvedValue({
      id: 'service-1',
      name: 'Corte',
      description: null,
      durationMinutes: 30,
      price: new Prisma.Decimal('45.50'),
      active: true,
      barbershopId: 'shop-1',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    });
    prismaMock.barbershopService.update.mockResolvedValue({
      id: 'service-1',
      name: 'Corte premium',
      description: 'Finalizacao inclusa',
      durationMinutes: 45,
      price: new Prisma.Decimal('55.00'),
      active: true,
      barbershopId: 'shop-1',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    });

    const result = await service.update('service-1', {
      name: '  Corte premium  ',
      description: '  Finalizacao inclusa  ',
      durationMinutes: 45,
      price: 55,
    });

    expect(prismaMock.barbershopService.update).toHaveBeenCalledWith({
      where: { id: 'service-1' },
      data: {
        name: 'Corte premium',
        description: 'Finalizacao inclusa',
        durationMinutes: 45,
        price: 55,
      },
    });
    expect(result.price).toBe(55);
  });

  it('deletes a service scoped to the current barbershop', async () => {
    prismaMock.barbershopService.findFirst.mockResolvedValue({
      id: 'service-1',
      name: 'Corte',
      description: null,
      durationMinutes: 30,
      price: new Prisma.Decimal('45.50'),
      active: true,
      barbershopId: 'shop-1',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    });
    prismaMock.barbershopService.delete.mockResolvedValue({
      id: 'service-1',
      name: 'Corte',
      description: null,
      durationMinutes: 30,
      price: new Prisma.Decimal('45.50'),
      active: true,
      barbershopId: 'shop-1',
      createdAt: new Date('2026-04-19T10:00:00.000Z'),
      updatedAt: new Date('2026-04-19T10:00:00.000Z'),
    });

    const result = await service.remove('service-1');

    expect(prismaMock.barbershopService.delete).toHaveBeenCalledWith({
      where: { id: 'service-1' },
    });
    expect(result.id).toBe('service-1');
  });
});
