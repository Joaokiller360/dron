import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokensService } from './refresh-tokens.service';

interface Row {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  sessionExpiresAt: Date;
  revokedAt: Date | null;
}

/** In-memory stand-in for the three prisma.refreshToken calls the service uses */
function fakePrisma() {
  const rows: Row[] = [];
  const matches = (r: Row, where: Record<string, unknown>) =>
    Object.entries(where).every(([k, v]) =>
      v && typeof v === 'object' && 'lt' in (v as object)
        ? (r[k as keyof Row] as Date) < (v as { lt: Date }).lt
        : r[k as keyof Row] === v,
    );
  const refreshToken = {
    create: async ({ data }: { data: Omit<Row, 'id' | 'revokedAt'> }) => {
      const row = { id: String(rows.length + 1), revokedAt: null, ...data };
      rows.push(row);
      return row;
    },
    findUnique: async ({ where }: { where: { tokenHash: string } }) =>
      rows.find((r) => r.tokenHash === where.tokenHash) ?? null,
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Partial<Row> }) => {
      const hit = rows.filter((r) => matches(r, where));
      hit.forEach((r) => Object.assign(r, data));
      return { count: hit.length };
    },
    deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
      const keep = rows.filter((r) => !matches(r, where));
      const count = rows.length - keep.length;
      rows.splice(0, rows.length, ...keep);
      return { count };
    },
  };
  return { rows, prisma: { refreshToken } as unknown as PrismaService };
}

const config = { get: (_: string, fallback: number) => fallback } as unknown as ConfigService;

describe('RefreshTokensService', () => {
  afterEach(() => jest.useRealTimers());

  it('rotates: the new token works, the used one does not', async () => {
    const { prisma } = fakePrisma();
    const svc = new RefreshTokensService(prisma, config);
    const first = await svc.issue('u1');
    const second = await svc.rotate(first.token);
    expect(second.userId).toBe('u1');
    expect(second.token).not.toBe(first.token);
    await expect(svc.rotate(first.token)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(svc.rotate(second.token)).resolves.toMatchObject({ userId: 'u1' });
  });

  it('reuse of a used token after the grace window revokes the whole session', async () => {
    jest.useFakeTimers({ now: new Date('2026-09-28T10:00:00Z') });
    const { prisma } = fakePrisma();
    const svc = new RefreshTokensService(prisma, config);
    const stolen = await svc.issue('u1');
    const legit = await svc.rotate(stolen.token);
    jest.setSystemTime(new Date('2026-09-28T10:05:00Z'));
    await expect(svc.rotate(stolen.token)).rejects.toBeInstanceOf(UnauthorizedException);
    // The legitimate holder's token died with the family
    await expect(svc.rotate(legit.token)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses expired tokens and never extends past the session limit', async () => {
    jest.useFakeTimers({ now: new Date('2026-09-01T00:00:00Z') });
    const { prisma } = fakePrisma();
    const svc = new RefreshTokensService(prisma, config);
    let current = await svc.issue('u1');
    // Refresh every 6 days: each stays inside the 7-day idle window…
    for (let day = 6; day < 30; day += 6) {
      jest.setSystemTime(new Date(Date.UTC(2026, 8, 1 + day)));
      current = await svc.rotate(current.token);
    }
    expect(current.expiresAt.getTime()).toBeLessThanOrEqual(Date.UTC(2026, 9, 1));
    // …but the 30-day session limit still ends it
    jest.setSystemTime(new Date(Date.UTC(2026, 9, 1, 0, 0, 1)));
    await expect(svc.rotate(current.token)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('revokeAll signs out every session of the user', async () => {
    const { prisma } = fakePrisma();
    const svc = new RefreshTokensService(prisma, config);
    const a = await svc.issue('u1');
    const b = await svc.issue('u1');
    const other = await svc.issue('u2');
    await svc.revokeAll('u1');
    await expect(svc.rotate(a.token)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(svc.rotate(b.token)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(svc.rotate(other.token)).resolves.toMatchObject({ userId: 'u2' });
  });
});
