import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

// Keys that can reach Object.prototype when a parsed body/query is merged or
// spread into another object (prototype pollution)
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_DEPTH = 20;

function hasForbiddenKey(value: unknown, depth = 0): boolean {
  if (value === null || typeof value !== 'object') return false;
  if (depth > MAX_DEPTH) return true; // absurdly nested input is rejected too
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key)) return true;
    if (hasForbiddenKey((value as Record<string, unknown>)[key], depth + 1)) return true;
  }
  return false;
}

/**
 * Rejects request bodies and query strings carrying prototype-pollution keys
 * or excessive nesting. Runs for every route, including ones whose body isn't
 * a validated DTO (e.g. the PayPal webhook).
 */
@Injectable()
export class SafeInputMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (hasForbiddenKey(req.body) || hasForbiddenKey(req.query)) {
      throw new BadRequestException('Invalid input');
    }
    next();
  }
}
