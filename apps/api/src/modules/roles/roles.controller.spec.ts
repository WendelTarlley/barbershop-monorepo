import { Test, TestingModule } from '@nestjs/testing';
import { BarbershopContextService } from 'src/common/barbershop-context/barbershop-context.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        RolesService,
        { provide: PrismaService, useValue: {} },
        { provide: BarbershopContextService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
