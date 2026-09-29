import { Controller, HttpException, HttpStatus, MessageEvent, Req, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { finalize, interval, map, merge, Observable } from 'rxjs';
import { clientIp } from '../common/client-ip';
import { EventsService } from './events.service';

// Open streams allowed at once: per client IP (one per browser tab, so this
// leaves room for several tabs or a shared office network) and in total
const MAX_STREAMS_PER_IP = 10;
const MAX_STREAMS_TOTAL = 1000;

@ApiTags('events')
@Controller('events')
export class EventsController {
  private readonly open = new Map<string, number>();
  private total = 0;

  constructor(private readonly events: EventsService) {}

  // Only resource names and actions go out, never record data, so the stream is
  // safe to expose publicly (the public site uses it to refresh itself).
  @Sse()
  // New connections (EventSource reconnects on its own after a drop)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: server-sent events whenever content changes' })
  stream(@Req() req: Request): Observable<MessageEvent> {
    const ip = clientIp(req);
    const mine = this.open.get(ip) ?? 0;
    if (mine >= MAX_STREAMS_PER_IP || this.total >= MAX_STREAMS_TOTAL) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.open.set(ip, mine + 1);
    this.total++;

    const changes = this.events
      .stream()
      .pipe(map((data) => ({ type: 'change', data }) as MessageEvent));
    // Heartbeat keeps proxies from closing idle connections
    const ping = interval(25_000).pipe(map(() => ({ type: 'ping', data: '' }) as MessageEvent));
    // Runs when the client disconnects (Nest unsubscribes on request close)
    return merge(changes, ping).pipe(finalize(() => this.release(ip)));
  }

  private release(ip: string) {
    this.total--;
    const left = (this.open.get(ip) ?? 1) - 1;
    if (left > 0) this.open.set(ip, left);
    else this.open.delete(ip);
  }
}
