import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactModule } from './contact/contact.module';
import { CategoriesModule } from './categories/categories.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { LegalPagesModule } from './legal-pages/legal-pages.module';
import { HealthModule } from './health/health.module';
import { EventsModule } from './events/events.module';
import { ChangeEventsInterceptor } from './events/change-events.interceptor';
import { ReorderModule } from './reorder/reorder.module';
import { PromotionsModule } from './promotions/promotions.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { StatsModule } from './stats/stats.module';
import { VenuesModule } from './venues/venues.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ContactModule,
    CategoriesModule,
    ProjectsModule,
    TeamMembersModule,
    ClientsModule,
    ServicesModule,
    LegalPagesModule,
    HealthModule,
    EventsModule,
    ReorderModule,
    PromotionsModule,
    TestimonialsModule,
    StatsModule,
    VenuesModule,
    SettingsModule,
    UploadsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ChangeEventsInterceptor },
  ],
})
export class AppModule {}
