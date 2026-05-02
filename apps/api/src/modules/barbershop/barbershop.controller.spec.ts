import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { BarbershopController } from './barbershop.controller';
import { BarbershopService } from './barbershop.service';

describe('BarbershopController', () => {
  let controller: BarbershopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarbershopController],
      providers: [
        BarbershopService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BarbershopController>(BarbershopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
