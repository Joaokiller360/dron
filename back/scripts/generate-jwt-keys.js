/* eslint-disable */
// New ES256 key pair for access tokens, printed as one-line base64 env values.
//
//   npm run jwt:keys
//
// JWT_PRIVATE_KEY goes ONLY to the auth service; JWT_PUBLIC_KEY to content,
// store and media. Rotating signs every admin out of the dashboard for at most
// the access-token lifetime (JWT_EXPIRES_IN); refresh sessions keep working.
const { generateKeyPairSync } = require('crypto');

const { privateKey, publicKey } = generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const b64 = (pem) => Buffer.from(pem).toString('base64');

console.log('# auth only (secret, never commit or paste it anywhere else):');
console.log(`JWT_PRIVATE_KEY=${b64(privateKey)}`);
console.log('');
console.log('# content, store, media (public):');
console.log(`JWT_PUBLIC_KEY=${b64(publicKey)}`);
