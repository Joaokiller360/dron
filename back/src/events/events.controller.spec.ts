import { HttpException } from '@nestjs/common';
import type { Request } from 'express';
import { Subscription } from 'rxjs';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

const reqFrom = (ip: string) => ({ ip, headers: {}, socket: {} }) as unknown as Request;

describe('EventsController stream limits', () => {
  let controller: EventsController;
  let subs: Subscription[];

  beforeEach(() => {
    controller = new EventsController(new EventsService());
    subs = [];
  });
  afterEach(() => subs.forEach((s) => s.unsubscribe()));

  const open = (ip: string) => {
    const sub = controller.stream(reqFrom(ip)).subscribe();
    subs.push(sub);
    return sub;
  };

  it('caps open streams per IP and frees the slot when a client disconnects', () => {
    for (let i = 0; i < 10; i++) open('203.0.113.1');
    expect(() => open('203.0.113.1')).toThrow(HttpException);
    // Another client is unaffected
    expect(() => open('203.0.113.2')).not.toThrow();

    subs[0].unsubscribe();
    expect(() => open('203.0.113.1')).not.toThrow();
  });
});
