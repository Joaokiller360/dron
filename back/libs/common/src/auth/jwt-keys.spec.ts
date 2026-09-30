import { JwtService } from '@nestjs/jwt';
import { generateKeyPairSync } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { validateEnv } from '../config/env.validation';
import { JWT_ALGORITHM, jwtPrivateKey, jwtPublicKey } from './jwt-keys';

const pair = (namedCurve = 'prime256v1') =>
  generateKeyPairSync('ec', {
    namedCurve,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
const b64 = (pem: string) => Buffer.from(pem).toString('base64');

describe('JWT keys', () => {
  const { privateKey, publicKey } = pair();

  it('auth signs ES256 tokens that the public key alone verifies', async () => {
    const signer = new JwtService({
      privateKey: jwtPrivateKey(b64(privateKey)),
      signOptions: { algorithm: JWT_ALGORITHM, expiresIn: 60 },
    });
    const token = await signer.signAsync({ sub: 'u1', email: 'a@example.com' });
    const verified = jwt.verify(token, jwtPublicKey({ publicKey: b64(publicKey) }), {
      algorithms: [JWT_ALGORITHM],
    }) as jwt.JwtPayload;
    expect(verified.sub).toBe('u1');
  });

  it('rejects HS256 tokens (the old shared-secret scheme) and tokens from another key', () => {
    const verifyKey = jwtPublicKey({ publicKey: b64(publicKey) });
    const hs = jwt.sign({ sub: 'u1' }, 'old-shared-secret', { algorithm: 'HS256' });
    expect(() => jwt.verify(hs, verifyKey, { algorithms: [JWT_ALGORITHM] })).toThrow();
    const other = jwt.sign({ sub: 'u1' }, pair().privateKey, { algorithm: JWT_ALGORITHM });
    expect(() => jwt.verify(other, verifyKey, { algorithms: [JWT_ALGORITHM] })).toThrow();
  });

  it('accepts PEM, PEM with literal \\n and base64 in env values', () => {
    const expected = jwtPublicKey({ publicKey });
    expect(jwtPublicKey({ publicKey: publicKey.replace(/\n/g, '\\n') })).toBe(expected);
    expect(jwtPublicKey({ publicKey: b64(publicKey) })).toBe(expected);
    expect(jwtPublicKey({ privateKey: b64(privateKey) })).toBe(expected);
  });

  it('refuses a private key where the public one belongs, and other curves', () => {
    expect(() => jwtPublicKey({ publicKey: b64(privateKey) })).toThrow(/private key/);
    expect(() => jwtPrivateKey(b64(pair('secp384r1').privateKey))).toThrow(/P-256/);
  });

  it('keeps the private key out of every service but auth', () => {
    const verifier = validateEnv(['JWT_PUBLIC_KEY']);
    expect(() => verifier({ JWT_PUBLIC_KEY: b64(publicKey) })).not.toThrow();
    expect(() =>
      verifier({ JWT_PUBLIC_KEY: b64(publicKey), JWT_PRIVATE_KEY: b64(privateKey) }),
    ).toThrow(/only be set in the auth service/);
    expect(() => validateEnv(['JWT_PRIVATE_KEY'])({ JWT_PRIVATE_KEY: 'garbage' })).toThrow();
  });
});
