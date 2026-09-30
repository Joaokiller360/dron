import { Module } from '@nestjs/common';
import { CoreModule } from '@app/common/core.module';
import { AuthClientModule } from '@app/common/auth/auth-client.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { StoreModule } from './store/store.module';

/** Store service: products, orders and payments (PayPal, bank transfer) */
@Module({
  imports: [
    CoreModule.forRoot({
      service: 'store',
      requiredEnv: ['DATABASE_URL', 'JWT_SECRET'],
      changeEvents: true,
    }),
    AuthClientModule,
    PrismaModule,
    HealthModule,
    StoreModule,
  ],
})
export class AppModule {}
