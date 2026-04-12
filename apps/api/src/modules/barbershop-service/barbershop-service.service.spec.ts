import { Test, TestingModule } from '@nestjs/testing';
import { BarbershopServiceService } from './barbershop-service.service';

describe('BarbershopServiceService', () => {
  let service: BarbershopServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarbershopServiceService],
    }).compile();

    service = module.get<BarbershopServiceService>(BarbershopServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
