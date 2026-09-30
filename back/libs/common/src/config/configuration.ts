const ACCESS_TTL_DEFAULT = 15 * 60;
const ACCESS_TTL_MAX = 60 * 60;
const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

/**
 * JWT_EXPIRES_IN ("900", "15m", "1h"…) in seconds, capped at 1 hour: access
 * tokens must stay short-lived even if an old "1d" value is still configured.
 */
function accessTokenTtl(raw: string | undefined): number {
  const m = raw?.trim().match(/^(\d+)\s*([smhd]?)$/i);
  if (!m) return ACCESS_TTL_DEFAULT;
  const seconds = Number(m[1]) * UNIT_SECONDS[(m[2] || 's').toLowerCase()];
  return seconds > 0 ? Math.min(seconds, ACCESS_TTL_MAX) : ACCESS_TTL_DEFAULT;
}

export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    // ES256 keys (see auth/jwt-keys.ts): the private one only in the auth service
    privateKey: process.env.JWT_PRIVATE_KEY,
    publicKey: process.env.JWT_PUBLIC_KEY,
    // Access tokens are short-lived; the dashboard renews them with the refresh token
    expiresIn: accessTokenTtl(process.env.JWT_EXPIRES_IN),
    // Refresh token (httpOnly cookie): idle lifetime, and hard session limit
    refreshTtlDays: parseInt(process.env.JWT_REFRESH_TTL_DAYS ?? '7', 10),
    sessionMaxDays: parseInt(process.env.JWT_SESSION_MAX_DAYS ?? '30', 10),
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    // Sender on a domain verified in Resend, e.g. "JB.SKYLENS <contacto@joaobarres.dev>"
    from: process.env.RESEND_FROM,
  },
  // S3 (or S3-compatible: R2, Spaces, MinIO) bucket for dashboard uploads
  s3: {
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    // Only for non-AWS providers, e.g. "https://<account>.r2.cloudflarestorage.com"
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    // Base URL files are served from (CDN or public bucket URL); defaults to the AWS bucket URL
    publicUrl: process.env.S3_PUBLIC_URL,
  },
  // PayPal checkout for the store (REST app from developer.paypal.com)
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    // "sandbox" for testing, "live" for real payments
    mode: process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox',
    // Id of the webhook registered for <API>/orders/paypal/webhook; events are
    // only trusted after PayPal confirms their signature against it
    webhookId: process.env.PAYPAL_WEBHOOK_ID,
  },
  // ClamAV daemon that scans every upload before it is published. Required in
  // production: without it uploads are refused.
  clamav: {
    host: process.env.CLAMAV_HOST,
    port: parseInt(process.env.CLAMAV_PORT ?? '3310', 10),
    timeoutMs: parseInt(process.env.CLAMAV_TIMEOUT_MS ?? '120000', 10),
  },
  logLevel: process.env.LOG_LEVEL ?? 'info',
  // Service-to-service calls: shared secret and each service's API base URL on
  // the private network (e.g. "http://jbskylens-auth:3000/api")
  internal: {
    token: process.env.INTERNAL_TOKEN,
    timeoutMs: parseInt(process.env.INTERNAL_TIMEOUT_MS ?? '3000', 10),
    urls: {
      auth: process.env.AUTH_URL,
      content: process.env.CONTENT_URL,
      store: process.env.STORE_URL,
      events: process.env.EVENTS_URL,
    },
  },
});
