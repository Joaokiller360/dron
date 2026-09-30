import { Logger } from '@nestjs/common';

const ENVIRONMENTS = ['development', 'production', 'test'];

/** Variables a service can refuse to boot without */
export type RequiredEnv = 'DATABASE_URL' | 'JWT_SECRET' | 'INTERNAL_TOKEN';

/**
 * ConfigModule validator for one service: checks NODE_ENV/PORT and that every
 * variable the service needs is set (each service only asks for its own).
 */
export function validateEnv(required: RequiredEnv[]) {
  return (config: Record<string, unknown>) => {
    const errors: string[] = [];
    const nodeEnv = config.NODE_ENV;
    if (nodeEnv !== undefined && !ENVIRONMENTS.includes(String(nodeEnv))) {
      errors.push(`NODE_ENV must be one of: ${ENVIRONMENTS.join(', ')}`);
    }
    const port = config.PORT;
    if (port !== undefined && !/^\d+$/.test(String(port))) {
      errors.push('PORT must be a non-negative integer');
    }
    for (const key of required) {
      if (typeof config[key] !== 'string' || !(config[key] as string).trim()) {
        errors.push(`${key} is required`);
      }
    }
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    // Short secrets make JWTs (and internal calls) brute-forceable; warn instead of refusing to boot
    for (const key of ['JWT_SECRET', 'INTERNAL_TOKEN'] as const) {
      if (required.includes(key) && (config[key] as string).length < 32) {
        new Logger('Config').warn(
          `${key} is shorter than 32 characters: use a long random value (e.g. \`openssl rand -base64 48\`)`,
        );
      }
    }
    return config;
  };
}
