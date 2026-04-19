// src/common/middlewares/barbershop.middleware.ts
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BarbershopMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const barbershopId = req.headers['barbershopid'];

    if (!barbershopId) {
      throw new BadRequestException('Header barbershopId é obrigatório');
    }

    // Injeta no request para acessar depois
    req['barbershopId'] = barbershopId;

    next();
  }
}