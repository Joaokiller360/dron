import { Injectable, Logger } from '@nestjs/common';
import { InternalClient } from '../internal/internal-client';

export interface ChangeEvent {
  /** API resource that changed, e.g. "projects", "services", "contact-messages" */
  resource: string;
  action: 'create' | 'update' | 'delete' | 'reorder';
  at: string;
}

/**
 * Tells the events service that a resource changed, so it can stream it to
 * browsers over SSE. Fire-and-forget: a missed notice only delays a refresh,
 * so a down events service never fails the write that caused it.
 */
@Injectable()
export class ChangePublisher {
  private readonly logger = new Logger(ChangePublisher.name);
  private lastWarning = 0;

  constructor(private readonly internal: InternalClient) {}

  emit(resource: string, action: ChangeEvent['action']) {
    const event: ChangeEvent = { resource, action, at: new Date().toISOString() };
    this.internal.post('events', 'events', event).catch((error: Error) => {
      // One warning a minute at most while the events service is away
      if (Date.now() - this.lastWarning > 60_000) {
        this.lastWarning = Date.now();
        this.logger.warn(`Change not announced (${resource} ${action}): ${error.message}`);
      }
    });
  }
}
