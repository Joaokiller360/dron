import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export interface ChangeEvent {
  /** API resource that changed, e.g. "projects", "services", "contact-messages" */
  resource: string;
  action: 'create' | 'update' | 'delete' | 'reorder';
  at: string;
}

/** In-process pub/sub for content changes, streamed to clients over SSE. */
@Injectable()
export class EventsService {
  private readonly subject = new Subject<ChangeEvent>();

  emit(resource: string, action: ChangeEvent['action']) {
    this.subject.next({ resource, action, at: new Date().toISOString() });
  }

  stream(): Observable<ChangeEvent> {
    return this.subject.asObservable();
  }
}
