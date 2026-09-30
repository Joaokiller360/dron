import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { winstonLoggerOptions } from './logger/winston.logger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { spanishValidationErrors } from './validation/validation-es';

/** Starts one service with the settings every JB.SKYLENS API shares */
export async function bootstrap(service: string, appModule: unknown, defaultPort: number) {
  process.env.SERVICE_NAME ??= service;
  const app = await NestFactory.create<NestExpressApplication>(appModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions()),
  });

  // req.ip must be the client, not the gateway/Traefik/Cloudflare, or every
  // visitor shares one rate-limit bucket. Numbers are hop counts; anything else is subnets.
  const trustProxy = process.env.TRUST_PROXY ?? 'loopback, linklocal, uniquelocal';
  app.set(
    'trust proxy',
    /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy === 'false' ? false : trustProxy,
  );

  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
    credentials: true,
  });

  const apiPrefix = process.env.API_PREFIX ?? 'api';
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: spanishValidationErrors,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`JB.SKYLENS API — ${service}`)
    .setVersion('0.2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Behind the gateway every service shares /api, so each one's docs get their own path
  SwaggerModule.setup(`${apiPrefix}/docs/${service}`, app, document);

  const port = process.env.PORT ?? defaultPort;
  await app.listen(port);
}
