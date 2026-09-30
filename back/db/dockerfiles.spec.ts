import { readFileSync } from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SERVICES, dockerfileFor } = require('../scripts/sync-dockerfiles.js');

// apps/<service>/Dockerfile are generated from back/Dockerfile; a stale copy
// would deploy an old recipe. Fix with `npm run dockerfiles`.
describe('per-service Dockerfiles', () => {
  it.each(SERVICES as string[])('apps/%s/Dockerfile matches back/Dockerfile', (service) => {
    const file = readFileSync(join(__dirname, '..', 'apps', service, 'Dockerfile'), 'utf8');
    expect(file).toBe(dockerfileFor(service));
    expect(file).toMatch(new RegExp(`^ARG APP=${service}$`, 'm'));
  });
});
