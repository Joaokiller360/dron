import { Logger } from '@nestjs/common';
import { jwtPrivateKey, jwtPublicKey } from '../auth/jwt-keys';

const ENVIRONMENTS = ['development', 'production', 'test'];

/** Variables a service can refuse to boot without */
export type RequiredEnv = 'DATABASE_URL' | 'JWT_PRIVATE_KEY' | 'JWT_PUBLIC_KEY' | 'INTERNAL_TOKEN';

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
    // Keys must parse and be ES256 now, not on the first login
    try {
      if (required.includes('JWT_PRIVATE_KEY') && config.JWT_PRIVATE_KEY) {
        jwtPrivateKey(config.JWT_PRIVATE_KEY as string);
      }
      if (required.includes('JWT_PUBLIC_KEY') && config.JWT_PUBLIC_KEY) {
        jwtPublicKey({ publicKey: config.JWT_PUBLIC_KEY as string });
      }
    } catch (error) {
      errors.push((error as Error).message);
    }
    // Only auth may sign tokens: a service that verifies must not hold the private key
    if (!required.includes('JWT_PRIVATE_KEY') && config.JWT_PRIVATE_KEY) {
      errors.push('JWT_PRIVATE_KEY must only be set in the auth service');
    }
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    if (config.JWT_SECRET) {
      new Logger('Config').warn('JWT_SECRET is no longer used (tokens are ES256); remove it');
    }
    // Short secrets make internal calls brute-forceable; warn instead of refusing to boot
    for (const key of ['INTERNAL_TOKEN'] as const) {
      if (required.includes(key) && (config[key] as string).length < 32) {
        new Logger('Config').warn(
          `${key} is shorter than 32 characters: use a long random value (e.g. \`openssl rand -base64 48\`)`,
        );
      }
    }
    return config;
  };
}
