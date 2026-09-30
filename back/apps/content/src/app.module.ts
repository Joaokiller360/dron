import { Module } from '@nestjs/common';
import { CoreModule } from '@app/common/core.module';
import { AuthClientModule } from '@app/common/auth/auth-client.module';
import { PrismaModule } from './prisma/prisma.module';
import { ContactModule } from './contact/contact.module';
import { CategoriesModule } from './categories/categories.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { LegalPagesModule } from './legal-pages/legal-pages.module';
import { HealthModule } from './health/health.module';
import { ReorderModule } from './reorder/reorder.module';
import { PromotionsModule } from './promotions/promotions.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { StatsModule } from './stats/stats.module';
import { VenuesModule } from './venues/venues.module';
import { SettingsModule } from './settings/settings.module';
import { ContentInternalController } from './internal/content-internal.controller';

/** Content service: everything the public site shows, plus the contact inbox */
@Module({
  imports: [
    CoreModule.forRoot({
      service: 'content',
      requiredEnv: ['DATABASE_URL', 'JWT_PUBLIC_KEY'],
      changeEvents: true,
    }),
    AuthClientModule,
    PrismaModule,
    ContactModule,
    CategoriesModule,
    ProjectsModule,
    TeamMembersModule,
    ClientsModule,
    ServicesModule,
    LegalPagesModule,
    HealthModule,
    ReorderModule,
    PromotionsModule,
    TestimonialsModule,
    StatsModule,
    VenuesModule,
    SettingsModule,
  ],
  controllers: [ContentInternalController],
})
export class AppModule {}
