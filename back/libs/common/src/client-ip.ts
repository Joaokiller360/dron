import type { Request } from 'express';

/**
 * The caller's IP, used as the rate-limit key. With CLIENT_IP_HEADER set (e.g.
 * "cf-connecting-ip") that header wins; otherwise Express's req.ip, which honors
 * the "trust proxy" setting from main.ts.
 */
export function clientIp(req: Request): string {
  const header = process.env.CLIENT_IP_HEADER?.trim().toLowerCase();
  if (header) {
    const raw = req.headers[header];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.split(',')[0]?.trim();
    if (value) return value;
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}
