import {
  applyDecorators,
  CanActivate,
  Controller,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';

export const INTERNAL_TOKEN_HEADER = 'x-internal-token';

const sameSecret = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Service-to-service routes: only callers holding INTERNAL_TOKEN get in. The
 * gateway also refuses /api/internal/*, so these never face the internet.
 * Anyone else gets a 404, as if the route didn't exist.
 */
@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.INTERNAL_TOKEN;
    const req = context.switchToHttp().getRequest<Request>();
    const given = req.headers[INTERNAL_TOKEN_HEADER];
    if (!expected || typeof given !== 'string' || !sameSecret(given, expected)) {
      throw new NotFoundException();
    }
    return true;
  }
}

/**
 * Controller under /internal/<path> for other services. Not rate limited per
 * IP (every call comes from a handful of service IPs) and hidden from Swagger.
 */
export const InternalController = (path: string) =>
  applyDecorators(
    Controller(`internal/${path}`),
    UseGuards(InternalGuard),
    SkipThrottle(),
    ApiExcludeController(),
  );
