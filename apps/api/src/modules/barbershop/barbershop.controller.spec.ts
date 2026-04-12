import { Test, TestingModule } from '@nestjs/testing';
import { BarbershopController } from './barbershop.controller';
import { BarbershopService } from './barbershop.service';

describe('BarbershopController', () => {
  let controller: BarbershopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarbershopController],
      providers: [BarbershopService],
    }).compile();

    controller = module.get<BarbershopController>(BarbershopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
