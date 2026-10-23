import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('GarmentFlowBootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Strict payload validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      /^http:\/\/192\.168\.\d+\.\d+:3000$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workstation-Node'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`================================================================`);
  logger.log(`🏭 GarmentFlow ERP Backend running on http://localhost:${port}/api/v1`);
  logger.log(`🔒 Mode: ${process.env.SERVER_MODE || 'FACTORY_LAN'} | Node: ${process.env.NODE_IDENTIFIER || 'BHILWARA_01'}`);
  logger.log(`================================================================`);
}

bootstrap();
