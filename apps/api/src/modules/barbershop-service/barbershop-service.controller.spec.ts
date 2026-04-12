import { Test, TestingModule } from '@nestjs/testing';
import { BarbershopServiceController } from './barbershop-service.controller';
import { BarbershopServiceService } from './barbershop-service.service';

describe('BarbershopServiceController', () => {
  let controller: BarbershopServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarbershopServiceController],
      providers: [BarbershopServiceService],
    }).compile();

    controller = module.get<BarbershopServiceController>(BarbershopServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
