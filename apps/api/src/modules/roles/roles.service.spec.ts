import { Test, TestingModule } from '@nestjs/testing';
import { BarbershopContextService } from 'src/common/barbershop-context/barbershop-context.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: {} },
        { provide: BarbershopContextService, useValue: {} },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
