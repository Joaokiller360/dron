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
  logLevel: process.env.LOG_LEVEL ?? 'info',
});
