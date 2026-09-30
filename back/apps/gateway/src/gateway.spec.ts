import * as http from 'node:http';
import * as net from 'node:net';
import type { AddressInfo } from 'node:net';
import { createGateway } from './gateway';
import { SERVICES, ServiceName } from './routes';

/** Sends raw bytes to the gateway and resolves with everything it answers */
function raw(port: number, bytes: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // write, not end: the gateway answers, then closes (Connection: close)
    const socket = net.connect(port, '127.0.0.1', () => socket.write(bytes));
    let out = '';
    socket.on('data', (d) => (out += d));
    socket.on('end', () => resolve(out));
    socket.on('error', reject);
  });
}

describe('gateway proxy', () => {
  let upstream: http.Server;
  let gateway: http.Server;
  let port: number;
  let seen: { method?: string; url?: string; body: string; headers: http.IncomingHttpHeaders }[];

  beforeAll(async () => {
    upstream = http.createServer((req, res) => {
      let body = '';
      req.on('data', (d) => (body += d));
      req.on('end', () => {
        seen.push({ method: req.method, url: req.url, body, headers: req.headers });
        res.end('ok');
      });
    });
    await new Promise<void>((r) => upstream.listen(0, '127.0.0.1', r));
    const origin = new URL(`http://127.0.0.1:${(upstream.address() as AddressInfo).port}`);
    const targets = Object.fromEntries(SERVICES.map((s) => [s, origin])) as Record<
      ServiceName,
      URL
    >;
    gateway = createGateway({ targets, prefix: '/api', upstreamTimeoutMs: 5000 });
    await new Promise<void>((r) => gateway.listen(0, '127.0.0.1', r));
    port = (gateway.address() as AddressInfo).port;
  });

  beforeEach(() => (seen = []));

  afterAll(async () => {
    await new Promise((r) => gateway.close(r));
    await new Promise((r) => upstream.close(r));
  });

  it('keeps a chunked body inside its own request (no smuggled second request)', async () => {
    const inner =
      'GET /api/internal/sessions/u1 HTTP/1.1\r\nHost: x\r\ncf-connecting-ip: 6.6.6.6\r\n\r\n';
    const chunked = `${inner.length.toString(16)}\r\n${inner}\r\n0\r\n\r\n`;
    for (const method of ['DELETE', 'GET', 'OPTIONS']) {
      seen = [];
      const answer = await raw(
        port,
        `${method} /api/projects/x HTTP/1.1\r\nHost: gw\r\nConnection: close\r\nTransfer-Encoding: chunked\r\n\r\n${chunked}`,
      );
      expect(answer).toMatch(/^HTTP\/1\.1 200/);
      expect(seen.map((r) => `${r.method} ${r.url}`)).toEqual([`${method} /api/projects/x`]);
      expect(seen[0].body).toBe(inner);
    }
  });

  it('refuses absolute-form request targets', async () => {
    const answer = await raw(
      port,
      'GET http://x/api/internal/sessions/u1 HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n',
    );
    expect(answer).toMatch(/^HTTP\/1\.1 400/);
    expect(seen).toEqual([]);
  });

  it('blocks internal routes and drops a client-sent internal token', async () => {
    const blocked = await raw(
      port,
      'GET /api/internal/sessions/u1 HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n',
    );
    expect(blocked).toMatch(/^HTTP\/1\.1 404/);
    await raw(
      port,
      'GET /api/projects HTTP/1.1\r\nHost: x\r\nx-internal-token: guess\r\nConnection: close\r\n\r\n',
    );
    expect(seen).toHaveLength(1);
    expect(seen[0].headers['x-internal-token']).toBeUndefined();
  });

  it('forwards normal requests with their body', async () => {
    const body = '{"titleEs":"Nuevo"}';
    await raw(
      port,
      `PATCH /api/projects/p1 HTTP/1.1\r\nHost: x\r\nContent-Type: application/json\r\nContent-Length: ${body.length}\r\nConnection: close\r\n\r\n${body}`,
    );
    expect(seen).toEqual([
      expect.objectContaining({ method: 'PATCH', url: '/api/projects/p1', body }),
    ]);
  });
});
