/**
 * API gateway: the only service with a public domain. Sends each /api request
 * to the service that owns it, streaming bodies both ways (SSE included), and
 * keeps /api/internal/* (service-to-service routes) off the internet.
 */
import { existsSync } from 'node:fs';
import { createGateway, log } from './gateway';
import { ServiceName, SERVICES } from './routes';

// Same env files as the Nest services; real env vars always win
for (const file of ['.env.gateway', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}

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

const port = Number(process.env.PORT ?? 8080);
const targets = origins();
const server = createGateway({
  targets,
  prefix: `/${(process.env.API_PREFIX ?? 'api').replace(/^\/|\/$/g, '')}`,
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS ?? 120_000),
});

server.listen(port, () => {
  log(
    'info',
    `Gateway on :${port} → ${SERVICES.map((s) => `${s}=${targets[s].origin}`).join(' ')}`,
  );
});

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    // Open SSE streams would keep close() waiting forever
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
