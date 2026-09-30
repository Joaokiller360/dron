/**
 * Gateway request handling. Plain node:http on purpose: no business logic lives here, and every service
 * keeps its own CORS, auth, validation and per-IP rate limits.
 */
import * as http from 'node:http';
import { routeFor, normalizePath, ServiceName, SERVICES } from './routes';

export interface GatewayOptions {
  /** Base origin of each service */
  targets: Record<ServiceName, URL>;
  /** Global API prefix, e.g. "/api" */
  prefix: string;
  /** Upstream time limit for normal requests (PayPal calls can take a while); SSE has none */
  upstreamTimeoutMs: number;
}

// Hop-by-hop headers (RFC 9110 §7.6.1) are for this connection only
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export function log(level: 'info' | 'warn' | 'error', message: string) {
  const line = JSON.stringify({
    level,
    service: 'gateway',
    message,
    timestamp: new Date().toISOString(),
  });
  (level === 'error' ? console.error : console.log)(line);
}

function sendJson(res: http.ServerResponse, status: number, path: string, body: object) {
  if (res.headersSent) return res.destroy();
  const payload = JSON.stringify({
    statusCode: status,
    timestamp: new Date().toISOString(),
    path,
    ...body,
  });
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

/**
 * The gateway server (not listening yet). Kept apart from main.ts so tests can
 * run it against local upstreams.
 */
export function createGateway({ targets, prefix, upstreamTimeoutMs }: GatewayOptions) {
  const agent = new http.Agent({ keepAlive: true, maxSockets: 256 });

  /** GET /api/health: every service's /health, so the dashboard sees the whole backend */
  async function health(res: http.ServerResponse, path: string) {
    const checks = await Promise.all(
      SERVICES.map(async (name) => {
        try {
          const r = await fetch(new URL(`${prefix}/health`, targets[name]), {
            signal: AbortSignal.timeout(3000),
          });
          return [name, r.ok ? 'ok' : `error ${r.status}`] as const;
        } catch {
          return [name, 'unreachable'] as const;
        }
      }),
    );
    const services = Object.fromEntries(checks);
    const ok = checks.every(([, s]) => s === 'ok');
    sendJson(res, ok ? 200 : 503, path, { status: ok ? 'ok' : 'degraded', services });
  }

  function proxy(req: http.IncomingMessage, res: http.ServerResponse, service: ServiceName) {
    const target = targets[service];
    const headers: http.OutgoingHttpHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!HOP_BY_HOP.has(key) && key !== 'x-internal-token' && value !== undefined)
        headers[key] = value;
    }
    // A chunked body loses its framing when transfer-encoding is dropped above. Node
    // only re-chunks POST/PUT/PATCH on its own; for GET/DELETE/OPTIONS it would send
    // the raw bytes, which the service then parses as a second request (smuggling
    // past the /internal block and the Cloudflare client-IP header). Re-frame it.
    if (
      req.headers['transfer-encoding'] !== undefined &&
      req.headers['content-length'] === undefined
    ) {
      headers['transfer-encoding'] = 'chunked';
    }
    // The service trusts private-network proxies, so it reads the client from this chain
    const remote = req.socket.remoteAddress ?? '';
    const prior = req.headers['x-forwarded-for'];
    headers['x-forwarded-for'] = prior ? `${prior}, ${remote}` : remote;
    headers['x-forwarded-proto'] ??= 'http';
    headers['x-forwarded-host'] ??= req.headers.host ?? '';

    const isStream = service === 'events';
    const upstream = http.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        method: req.method,
        path: req.url,
        headers,
        agent,
      },
      (up) => {
        const out: http.OutgoingHttpHeaders = {};
        for (const [key, value] of Object.entries(up.headers)) {
          if (!HOP_BY_HOP.has(key) && value !== undefined) out[key] = value;
        }
        // SSE: tell any proxy in front (Traefik, Cloudflare) not to buffer
        if (isStream) out['x-accel-buffering'] = 'no';
        res.writeHead(up.statusCode ?? 502, up.statusMessage, out);
        if (isStream) res.flushHeaders();
        up.pipe(res);
      },
    );

    if (!isStream) {
      upstream.setTimeout(upstreamTimeoutMs, () => upstream.destroy(new Error('upstream timeout')));
    }
    upstream.on('error', (error) => {
      log('error', `${req.method} ${req.url} → ${service}: ${error.message}`);
      sendJson(res, 502, req.url ?? '', {
        message: 'Servicio no disponible. Inténtalo de nuevo en un momento.',
      });
    });
    // Client went away (closed tab, SSE disconnect): free the upstream connection
    res.on('close', () => {
      if (!res.writableFinished) upstream.destroy();
    });
    req.pipe(upstream);
  }

  const server = http.createServer((req, res) => {
    // Origin-form targets only ("/api/..."). An absolute-form target
    // ("http://host/api/internal/...") would be routed on its scheme/host while
    // the service's router reads its path.
    if (!req.url?.startsWith('/')) {
      return sendJson(res, 400, '', { message: 'Solicitud no válida' });
    }
    const rawPath = req.url.split('?')[0];
    const path = normalizePath(rawPath);
    if (path === null) return sendJson(res, 400, rawPath, { message: 'Solicitud no válida' });

    const route = routeFor(path, prefix);
    if (route === 'blocked')
      return sendJson(res, 404, rawPath, { message: 'La ruta solicitada no existe' });
    if (route === 'health') {
      if (req.method !== 'GET')
        return sendJson(res, 405, rawPath, { message: 'Método no permitido' });
      health(res, rawPath).catch((e: Error) => sendJson(res, 500, rawPath, { message: e.message }));
      return;
    }
    proxy(req, res, route);
  });

  // Node's default requestTimeout (300 s to receive a request) stays: SSE streams
  // are long responses, not long requests. Idle keep-alive sockets close after 65 s.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  return server;
}
