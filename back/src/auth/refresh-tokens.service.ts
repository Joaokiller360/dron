import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;
// Two tabs refreshing at the same moment both present the same token; the
// loser of that race isn't a thief, so it's refused without ending the session
const REUSE_GRACE_MS = 30_000;

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export interface IssuedRefreshToken {
  token: string;
  expiresAt: Date;
}

/**
 * Opaque, rotating refresh tokens. Only their SHA-256 is stored. Each use
 * revokes the token and issues the next one in the same family; presenting an
 * already-used token (after the grace window) revokes the whole family.
 */
@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name);
  private readonly ttlMs: number;
  private readonly sessionMaxMs: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.ttlMs = config.get<number>('jwt.refreshTtlDays', 7) * DAY_MS;
    this.sessionMaxMs = config.get<number>('jwt.sessionMaxDays', 30) * DAY_MS;
  }

  /** Starts a new session (login, password change) */
  issue(userId: string): Promise<IssuedRefreshToken> {
    return this.create(userId, randomUUID(), new Date(Date.now() + this.sessionMaxMs));
  }

  /** Swaps a valid refresh token for the next one; returns its owner */
  async rotate(token: string): Promise<{ userId: string } & IssuedRefreshToken> {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash(token) } });
    if (!row) throw new UnauthorizedException();

    const now = Date.now();
    if (row.revokedAt) {
      if (now - row.revokedAt.getTime() > REUSE_GRACE_MS) {
        this.logger.warn(
          `Refresh token reuse for user ${row.userId}: session ${row.familyId} revoked`,
        );
        await this.revokeFamily(row.familyId);
      }
      throw new UnauthorizedException();
    }
    if (row.expiresAt.getTime() <= now || row.sessionExpiresAt.getTime() <= now) {
      throw new UnauthorizedException();
    }

    // Conditional update: of two concurrent rotations only one wins
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id: row.id, revokedAt: null },
      data: { revokedAt: new Date(now) },
    });
    if (count !== 1) throw new UnauthorizedException();

    const next = await this.create(row.userId, row.familyId, row.sessionExpiresAt);
    return { userId: row.userId, ...next };
  }

  /** Logout: ends the session the token belongs to */
  async revoke(token: string) {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash(token) } });
    if (row) await this.revokeFamily(row.familyId);
  }

  /** Password change: ends every session of the user */
  async revokeAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeFamily(familyId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async create(userId: string, familyId: string, sessionExpiresAt: Date) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Math.min(Date.now() + this.ttlMs, sessionExpiresAt.getTime()));
    await this.prisma.refreshToken.create({
      data: { userId, familyId, tokenHash: hash(token), expiresAt, sessionExpiresAt },
    });
    // Housekeeping: drop this user's rows that can no longer be used or matter for reuse detection
    await this.prisma.refreshToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date(Date.now() - DAY_MS) } },
    });
    return { token, expiresAt };
  }
}
