import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INTERNAL_TOKEN_HEADER } from './internal.guard';

export type ServiceName = 'auth' | 'content' | 'store' | 'events';

/** A call to another service failed: status is its HTTP status, or 0 if it never answered */
export class InternalCallError extends Error {
  constructor(
    readonly service: ServiceName,
    readonly status: number,
    message: string,
  ) {
    super(`${service}: ${message}`);
  }
}

/** HTTP client for the /internal routes of the other services */
@Injectable()
export class InternalClient {
  constructor(private readonly config: ConfigService) {}

  get<T>(service: ServiceName, path: string) {
    return this.request<T>(service, 'GET', path);
  }

  post<T>(service: ServiceName, path: string, body: unknown) {
    return this.request<T>(service, 'POST', path, body);
  }

  private async request<T>(
    service: ServiceName,
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const base = this.config.get<string>(`internal.urls.${service}`);
    const token = this.config.get<string>('internal.token');
    if (!base || !token) {
      throw new InternalCallError(service, 0, 'not configured (URL or INTERNAL_TOKEN missing)');
    }
    let res: Response;
    try {
      res = await fetch(`${base.replace(/\/$/, '')}/internal/${path}`, {
        method,
        headers: {
          [INTERNAL_TOKEN_HEADER]: token,
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.config.get<number>('internal.timeoutMs', 3000)),
      });
    } catch (error) {
      throw new InternalCallError(service, 0, (error as Error).message);
    }
    if (!res.ok) {
      throw new InternalCallError(service, res.status, `${method} ${path} → ${res.status}`);
    }
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
}
