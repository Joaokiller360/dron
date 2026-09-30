/**
 * API gateway: the only service with a public domain. Sends each /api request
 * to the service that owns it, streaming bodies both ways (SSE included), and
 * keeps /api/internal/* (service-to-service routes) off the internet.
 *
 * Plain node:http on purpose: no business logic lives here, and every service
 * keeps its own CORS, auth, validation and per-IP rate limits.
 */
import { existsSync } from 'node:fs';
import * as http from 'node:http';
import { routeFor, normalizePath, ServiceName, SERVICES } from './routes';

// Same env files as the Nest services; real env vars always win
for (const file of ['.env.gateway', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const PORT = Number(process.env.PORT ?? 8080);
const PREFIX = `/${(process.env.API_PREFIX ?? 'api').replace(/^\/|\/$/g, '')}`;
/** Upstream time limit for normal requests (PayPal calls can take a while); SSE has none */
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS ?? 120_000);

/** Base origin of each service, from the same *_URL vars the services use to call each other */
function origins(): Record<ServiceName, URL> {
  const out = {} as Record<ServiceName, URL>;
  for (const name of SERVICES) {
    const raw = process.env[`${name.toUpperCase()}_URL`];
    if (!raw) throw new Error(`${name.toUpperCase()}_URL is required`);
    out[name] = new URL(raw);
  }
  return out;
}
const TARGETS = origins();

const agent = new http.Agent({ keepAlive: true, maxSockets: 256 });

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

function log(level: 'info' | 'warn' | 'error', message: string) {
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

/** GET /api/health: every service's /health, so the dashboard sees the whole backend */
async function health(res: http.ServerResponse, path: string) {
  const checks = await Promise.all(
    SERVICES.map(async (name) => {
      try {
        const r = await fetch(new URL(`${PREFIX}/health`, TARGETS[name]), {
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
  const target = TARGETS[service];
  const headers: http.OutgoingHttpHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(key) && key !== 'x-internal-token' && value !== undefined)
      headers[key] = value;
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
    upstream.setTimeout(UPSTREAM_TIMEOUT_MS, () => upstream.destroy(new Error('upstream timeout')));
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
  const rawPath = (req.url ?? '/').split('?')[0];
  const path = normalizePath(rawPath);
  if (path === null) return sendJson(res, 400, rawPath, { message: 'Solicitud no válida' });

  const route = routeFor(path, PREFIX);
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

// SSE streams stay open for hours; only idle keep-alive sockets are timed out
server.requestTimeout = 0;
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

server.listen(PORT, () => {
  log(
    'info',
    `Gateway on :${PORT} → ${SERVICES.map((s) => `${s}=${TARGETS[s].origin}`).join(' ')}`,
  );
});

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    // Open SSE streams would keep close() waiting forever
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
