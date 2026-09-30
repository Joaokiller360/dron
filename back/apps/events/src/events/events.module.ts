import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsInternalController } from './events-internal.controller';

@Module({
  controllers: [EventsController, EventsInternalController],
  providers: [EventsService],
})
export class EventsModule {}
