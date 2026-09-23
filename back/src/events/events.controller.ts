import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { interval, map, merge, Observable } from 'rxjs';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
@SkipThrottle()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  // Only resource names and actions go out, never record data, so the stream is
  // safe to expose publicly (the public site uses it to refresh itself).
  @Sse()
  @ApiOperation({ summary: 'Public: server-sent events whenever content changes' })
  stream(): Observable<MessageEvent> {
    const changes = this.events
      .stream()
      .pipe(map((data) => ({ type: 'change', data }) as MessageEvent));
    // Heartbeat keeps proxies from closing idle connections
    const ping = interval(25_000).pipe(map(() => ({ type: 'ping', data: '' }) as MessageEvent));
    return merge(changes, ping);
  }
}
