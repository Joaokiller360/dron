import { Module } from '@nestjs/common';
import { CoreModule } from '@app/common/core.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { SessionsController } from './internal/sessions.controller';

/** Auth service: admin accounts, login, refresh-token sessions */
@Module({
  imports: [
    CoreModule.forRoot({
      service: 'auth',
      requiredEnv: ['DATABASE_URL', 'JWT_PRIVATE_KEY', 'INTERNAL_TOKEN'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [SessionsController],
})
export class AppModule {}
