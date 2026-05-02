import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { BarbershopService } from './barbershop.service';

describe('BarbershopService', () => {
  let service: BarbershopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarbershopService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BarbershopService>(BarbershopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
