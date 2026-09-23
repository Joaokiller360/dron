import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ChangeEvent, EventsService } from './events.service';

const ACTIONS: Record<string, ChangeEvent['action']> = {
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

// Routes whose writes aren't content changes
const IGNORED = new Set(['auth', 'events', 'health']);

/**
 * After every successful write, announce which resource changed. The resource
 * is the first path segment after the global prefix (/api/v1/projects/:id →
 * "projects"); /reorder/:resource announces its target resource.
 */
@Injectable()
export class ChangeEventsInterceptor implements NestInterceptor {
  constructor(private readonly events: EventsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const action = ACTIONS[req.method as string];
    if (!action) return next.handle();

    const prefix = `/${(process.env.API_PREFIX ?? 'api').replace(/^\/|\/$/g, '')}/`;
    const path: string = (req.originalUrl ?? req.url ?? '').split('?')[0];
    const rest = path.startsWith(prefix) ? path.slice(prefix.length) : path.replace(/^\//, '');
    const [first, second] = rest.split('/');
    const isReorder = first === 'reorder';
    const resource = isReorder ? second : first;
    if (!resource || IGNORED.has(resource)) return next.handle();

    return next
      .handle()
      .pipe(tap(() => this.events.emit(resource, isReorder ? 'reorder' : action)));
  }
}
