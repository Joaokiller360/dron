import { Module } from '@nestjs/common';
import { CoreModule } from '@app/common/core.module';
import { ProcessHealthModule } from '@app/common/health/health.module';
import { EventsModule } from './events/events.module';

/** Events service: live "something changed" stream (SSE) for the site and dashboard */
@Module({
  imports: [
    CoreModule.forRoot({ service: 'events', requiredEnv: ['INTERNAL_TOKEN'] }),
    ProcessHealthModule,
    EventsModule,
  ],
})
export class AppModule {}
