import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsString, Min, validateSync, IsOptional } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @IsOptional()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  // Short secrets make JWTs brute-forceable; warn instead of refusing to boot
  if (validatedConfig.JWT_SECRET.length < 32) {
    new Logger('Config').warn(
      'JWT_SECRET is shorter than 32 characters: use a long random value (e.g. `openssl rand -base64 48`)',
    );
  }
  return validatedConfig;
}
