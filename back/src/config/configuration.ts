export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    // Sender on a domain verified in Resend, e.g. "JB.SKYLENS <contacto@joaobarres.dev>"
    from: process.env.RESEND_FROM,
  },
  logLevel: process.env.LOG_LEVEL ?? 'info',
});
