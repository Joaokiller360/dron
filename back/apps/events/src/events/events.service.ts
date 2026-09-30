import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import type { ChangeEvent } from '@app/common/events/change-publisher';

export type { ChangeEvent };

/**
 * Pub/sub for content changes, streamed to clients over SSE. The other
 * services announce their writes through POST /internal/events.
 */
@Injectable()
export class EventsService {
  private readonly subject = new Subject<ChangeEvent>();

  emit(resource: string, action: ChangeEvent['action'], at = new Date().toISOString()) {
    this.subject.next({ resource, action, at });
  }

  stream(): Observable<ChangeEvent> {
    return this.subject.asObservable();
  }
}
