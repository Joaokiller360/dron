import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

// split-schemas.sql marks each service's 0_init migration as applied; Prisma
// compares that checksum with the file, so they must never drift apart.
describe('db/split-schemas.sql', () => {
  const sql = readFileSync(join(__dirname, 'split-schemas.sql'), 'utf8');

  it.each(['auth', 'content', 'store'])('baselines %s with the checksum of its 0_init', (app) => {
    const file = join(
      __dirname,
      '..',
      'apps',
      app,
      'prisma',
      'migrations',
      '0_init',
      'migration.sql',
    );
    const checksum = createHash('sha256').update(readFileSync(file)).digest('hex');
    expect(sql).toContain(`INSERT INTO ${app}._prisma_migrations`);
    const row = sql.split(`INSERT INTO ${app}._prisma_migrations`)[1].split(';')[0];
    expect(row).toContain(`'${checksum}'`);
  });
});
