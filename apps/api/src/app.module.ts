import { Module } from '@nestjs/common';
import { Request } from 'express';
import { ClsModule } from 'nestjs-cls';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BarbershopContextModule } from './common/barbershop-context/barbershop-context.module';
import {
  BARBERSHOP_CLS_KEY,
  BARBERSHOP_HEADER,
} from './common/barbershop-context/barbershop-context.constants';
import { AuthModule } from './modules/auth/auth.module';
import { BarbershopModule } from './modules/barbershop/barbershop.module';
import { BarbershopServiceModule } from './modules/barbershop-service/barbershop-service.module';
import { MailModule } from './modules/mail/mail.module';
import { RolesModule } from './modules/roles/roles.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    UserModule,
    BarbershopModule,
    BarbershopServiceModule,
    AuthModule,
    MailModule,
    RolesModule,
    BarbershopContextModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: Request) => {
          const barbershopId =
            req.header(BARBERSHOP_HEADER)?.trim() ??
            req.header('barbershopid')?.trim() ??
            req.header('x-barbershopid')?.trim();

          if (barbershopId) {
            cls.set(BARBERSHOP_CLS_KEY, barbershopId);
          }
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
