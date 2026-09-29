import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { winstonLoggerOptions } from './common/logger/winston.logger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { spanishValidationErrors } from './common/validation/validation-es';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });

  // req.ip must be the client, not Traefik/Cloudflare, or every visitor shares
  // one rate-limit bucket. Numbers are hop counts; anything else is subnets.
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('JB.SKYLENS API')
    .setDescription('Backend API for contact messages and portfolio projects')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
