const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * POST to /quotes/public/<token>/<action> from the client's browser. Throws
 * with the API's (Spanish) message when it refuses.
 */
export async function quoteAction(token: string, action: 'accept' | 'reject' | 'view', body?: unknown) {
  const res = await fetch(`${API_URL}/quotes/public/${encodeURIComponent(token)}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    keepalive: action === 'view',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.message?.message ?? data?.message;
    throw new Error(Array.isArray(msg) ? msg.join('. ') : typeof msg === 'string' ? msg : '');
  }
}
