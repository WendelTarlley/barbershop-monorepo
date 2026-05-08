import { config } from 'dotenv';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

config({
  path: resolve(__dirname, '..', '..', '..', '.env'),
});

function getAllowedCorsOrigins() {
  return [
    process.env.APP_URL,
    process.env.CUSTOMER_WEB_URL,
    'http://localhost:3001',
    'http://localhost:3002',
  ].filter((origin): origin is string => Boolean(origin));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (requestOrigin, callback) => {
      const allowedOrigins = getAllowedCorsOrigins();

      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${requestOrigin} is not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Barbershop-Id'],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.listen(process.env.API_PORT ?? 3000);
}
void bootstrap();
