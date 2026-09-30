import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { RequiredEnv, validateEnv } from './config/env.validation';
import { ClientIpThrottlerGuard } from './guards/client-ip-throttler.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { SafeInputMiddleware } from './middleware/safe-input.middleware';
import { InternalClient } from './internal/internal-client';
import { ChangePublisher } from './events/change-publisher';
import { ChangeEventsInterceptor } from './events/change-events.interceptor';

export interface CoreOptions {
  /** Service name: also loads .env.<service> (its own DATABASE_URL, PORT…) before .env */
  service: string;
  /** Env vars the service refuses to boot without */
  requiredEnv: RequiredEnv[];
  /** Announce successful writes to the events service (content, store) */
  changeEvents?: boolean;
}

/**
 * What every service shares: config, per-IP rate limit, request logging,
 * prototype-pollution filter, and the client for calling other services.
 */
@Global()
@Module({})
export class CoreModule implements NestModule {
  static forRoot({ service, requiredEnv, changeEvents = false }: CoreOptions): DynamicModule {
    const providers: Provider[] = [
      InternalClient,
      ChangePublisher,
      { provide: APP_GUARD, useClass: ClientIpThrottlerGuard },
      { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    ];
    if (changeEvents) {
      providers.push({ provide: APP_INTERCEPTOR, useClass: ChangeEventsInterceptor });
    }
    return {
      module: CoreModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [`.env.${service}`, '.env'],
          load: [configuration],
          validate: validateEnv(changeEvents ? [...requiredEnv, 'INTERNAL_TOKEN'] : requiredEnv),
        }),
        // 100 requests per minute per client IP on every route of this service
        // (stricter per-route limits are set with @Throttle, e.g. the login)
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60_000, limit: 100 }],
        }),
      ],
      providers,
      exports: [InternalClient, ChangePublisher],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SafeInputMiddleware).forRoutes('*');
  }
}
