import { Test, TestingModule } from '@nestjs/testing';
import { BarbershopServiceController } from './barbershop-service.controller';
import { BarbershopServiceService } from './barbershop-service.service';
import { CreateBarbershopServiceDto } from './dto/create-barbershop-service.dto';
import { UpdateBarbershopServiceDto } from './dto/update-barbershop-service.dto';

describe('BarbershopServiceController', () => {
  let controller: BarbershopServiceController;
  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByBarbershopId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarbershopServiceController],
      providers: [
        {
          provide: BarbershopServiceService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<BarbershopServiceController>(BarbershopServiceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates creation to the service layer', () => {
    const dto: CreateBarbershopServiceDto = {
      name: 'Corte social',
      durationMinutes: 45,
      price: 35,
    };

    controller.create(dto);

    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('delegates scoped list by barbershop id', () => {
    controller.findAllByBarbershopId('shop-1');

    expect(serviceMock.findAllByBarbershopId).toHaveBeenCalledWith('shop-1');
  });

  it('keeps service id as string when updating', () => {
    const dto: UpdateBarbershopServiceDto = {
      name: 'Barba completa',
    };

    controller.update('service-1', dto);

    expect(serviceMock.update).toHaveBeenCalledWith('service-1', dto);
  });

  it('keeps service id as string when removing', () => {
    controller.remove('service-2');

    expect(serviceMock.remove).toHaveBeenCalledWith('service-2');
  });
});
