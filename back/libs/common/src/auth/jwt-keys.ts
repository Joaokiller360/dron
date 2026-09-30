import { createPrivateKey, createPublicKey, KeyObject } from 'crypto';

/**
 * Access tokens are signed with ES256: only the auth service holds the private
 * key (JWT_PRIVATE_KEY); every other service verifies with the public key
 * (JWT_PUBLIC_KEY), so a compromised content/store/media process can't mint
 * admin tokens. Generate a pair with `npm run jwt:keys`.
 */
export const JWT_ALGORITHM = 'ES256' as const;

/** Env value → PEM: a PEM, a PEM with literal "\n", or the PEM base64-encoded (one line) */
function toPem(raw: string): string {
  const value = raw.trim().replace(/\\n/g, '\n');
  return value.includes('-----BEGIN') ? value : Buffer.from(value, 'base64').toString('utf8');
}

function assertP256(key: KeyObject, name: string) {
  if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') {
    throw new Error(`${name} must be an EC P-256 key (ES256); generate one with npm run jwt:keys`);
  }
}

/** Signing key (auth only), as PKCS#8 PEM */
export function jwtPrivateKey(raw: string): string {
  const key = createPrivateKey(toPem(raw));
  assertP256(key, 'JWT_PRIVATE_KEY');
  return key.export({ type: 'pkcs8', format: 'pem' }) as string;
}

/** Verification key as SPKI PEM: JWT_PUBLIC_KEY, or derived from the private key in auth */
export function jwtPublicKey({
  publicKey,
  privateKey,
}: {
  publicKey?: string;
  privateKey?: string;
}) {
  let key: KeyObject;
  if (publicKey) {
    const pem = toPem(publicKey);
    // createPublicKey also accepts a private key; that would put signing power back here
    if (/PRIVATE KEY/.test(pem)) {
      throw new Error('JWT_PUBLIC_KEY holds a private key: only the auth service may have it');
    }
    key = createPublicKey(pem);
    assertP256(key, 'JWT_PUBLIC_KEY');
  } else if (privateKey) {
    key = createPublicKey(jwtPrivateKey(privateKey));
  } else {
    throw new Error('JWT_PUBLIC_KEY is required');
  }
  return key.export({ type: 'spki', format: 'pem' }) as string;
}
