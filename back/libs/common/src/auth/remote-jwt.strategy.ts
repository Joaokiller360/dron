import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InternalCallError, InternalClient } from '../internal/internal-client';

export interface JwtPayload {
  sub: string;
  email: string;
  /** Issued at, in seconds */
  iat?: number;
}

/** What the auth service says about an admin (GET /internal/sessions/:id) */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  /** ISO date; tokens issued before it were signed out */
  passwordChangedAt: string | null;
}

/** How long an admin lookup is reused before asking the auth service again */
const CACHE_MS = 30_000;

/**
 * JWT check for every service except auth: the signature is verified here with
 * the shared JWT_SECRET, then the auth service confirms the admin still exists
 * and the token predates no password change (answers cached 30 s, so a sign-out
 * by password change reaches every service within that time).
 */
@Injectable()
export class RemoteJwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(RemoteJwtStrategy.name);
  private readonly cache = new Map<string, { at: number; user: SessionUser | null }>();

  constructor(
    private readonly internal: InternalClient,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.lookup(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Issued before the last password change: that session was signed out
    // (1 s of slack, since iat is rounded down to the second)
    if (
      user.passwordChangedAt &&
      (payload.iat ?? 0) * 1000 < new Date(user.passwordChangedAt).getTime() - 1000
    ) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, name: user.name };
  }

  private async lookup(id: string): Promise<SessionUser | null> {
    const hit = this.cache.get(id);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.user;
    let user: SessionUser | null;
    try {
      user = await this.internal.get<SessionUser>('auth', `sessions/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof InternalCallError && error.status === 404) {
        user = null;
      } else {
        this.logger.error(`Auth service unreachable: ${(error as Error).message}`);
        throw new ServiceUnavailableException();
      }
    }
    // Only a handful of admins exist; the cap just keeps forged "sub"s from growing the map
    if (this.cache.size > 1000) this.cache.clear();
    this.cache.set(id, { at: Date.now(), user });
    return user;
  }
}
