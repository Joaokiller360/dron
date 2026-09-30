/* eslint-disable */
// Writes apps/<service>/Dockerfile: the root Dockerfile with APP preset, so a
// host that can't pass build args just points at the service's Dockerfile.
//
//   npm run dockerfiles         (after editing back/Dockerfile)
const fs = require('fs');
const path = require('path');

const SERVICES = ['gateway', 'auth', 'content', 'store', 'media', 'events'];
const root = path.join(__dirname, '..');

function dockerfileFor(service) {
  const template = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf8');
  if (!/^ARG APP$/m.test(template)) throw new Error('Dockerfile must declare a global "ARG APP"');
  return (
    `# GENERATED from back/Dockerfile by \`npm run dockerfiles\`: edit that file instead.\n` +
    template.replace(/^ARG APP$/m, `ARG APP=${service}`)
  );
}

module.exports = { SERVICES, dockerfileFor };

if (require.main === module) {
  for (const service of SERVICES) {
    fs.writeFileSync(path.join(root, 'apps', service, 'Dockerfile'), dockerfileFor(service));
    console.log(`apps/${service}/Dockerfile`);
  }
}
