export const SERVICES = ['auth', 'content', 'store', 'media', 'events'] as const;
export type ServiceName = (typeof SERVICES)[number];

/**
 * First path segment after /api → owning service; anything not listed goes to
 * content. "reorder/products" is the one two-segment rule: products live in
 * the store, every other /reorder/:resource in content.
 */
const OWNERS: Record<string, ServiceName> = {
  auth: 'auth',
  products: 'store',
  orders: 'store',
  store: 'store',
  'reorder/products': 'store',
  uploads: 'media',
  events: 'events',
};

/**
 * The path as the services' router will understand it: percent-decoded,
 * lower-cased (Express routes are case-insensitive), duplicate slashes and
 * dot segments resolved. null when it can't be decoded.
 */
export function normalizePath(raw: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const out: string[] = [];
  for (const seg of path.toLowerCase().split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return `/${out.join('/')}`;
}

/** Where a normalized path goes: a service, the gateway's own health check, or nowhere */
export function routeFor(path: string, prefix: string): ServiceName | 'health' | 'blocked' {
  const segs = path.split('/').filter(Boolean);
  const pre = normalizePath(prefix)!.split('/').filter(Boolean);
  // Outside the API prefix: let content answer (its 404)
  if (segs.slice(0, pre.length).join('/') !== pre.join('/')) return 'content';
  const rest = segs.slice(pre.length);
  // Service-to-service routes are never reachable from outside
  if (rest[0] === 'internal') return 'blocked';
  if (rest.length === 1 && rest[0] === 'health') return 'health';
  // Each service's Swagger UI lives at /api/docs/<service>
  if (rest[0] === 'docs' && (SERVICES as readonly string[]).includes(rest[1])) {
    return rest[1] as ServiceName;
  }
  // Own keys only: "constructor", "__proto__"… must not resolve to Object.prototype members
  const owner = (key: string) =>
    Object.prototype.hasOwnProperty.call(OWNERS, key) ? OWNERS[key] : undefined;
  return owner(rest.slice(0, 2).join('/')) ?? owner(rest[0] ?? '') ?? 'content';
}
