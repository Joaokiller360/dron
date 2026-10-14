/**
 * Converts the images already saved in the database to WebP (new uploads are
 * converted by the API in uploads.service.ts).
 *
 * - Files in our bucket (S3_PUBLIC_URL) ending in .jpg/.jpeg/.png are
 *   re-encoded with sharp and saved next to the original as .webp; the
 *   database then points at the .webp file.
 * - Cloudinary images get `f_webp,q_auto:eco` in their URL, so Cloudinary
 *   serves them as compressed WebP. Video thumbnails are left as they are.
 * - Any other external image is only listed: it isn't ours to convert.
 *
 * Dry run by default (reads the database and the bucket, writes nothing):
 *
 *   npx ts-node prisma/convert-images-webp.ts
 *   npx ts-node prisma/convert-images-webp.ts --apply
 *   npx ts-node prisma/convert-images-webp.ts --apply --delete-originals
 *
 * Originals are kept unless --delete-originals is passed (old links in emails
 * keep working). Safe to re-run: converted files are reused, not redone.
 */
import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import { toWebp, webpKey } from '../src/uploads/webp';

const APPLY = process.argv.includes('--apply');
const DELETE_ORIGINALS = process.argv.includes('--delete-originals');
const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const MAX_IMAGE_PIXELS = 60_000_000;
const RASTER = /\.(jpe?g|png)$/i;
// Image delivery only: f_auto on a video thumbnail URL can return a video
const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

const prisma = new PrismaClient();

const {
  S3_BUCKET: bucket,
  S3_REGION: region = 'us-east-1',
  S3_ACCESS_KEY_ID: accessKeyId,
  S3_SECRET_ACCESS_KEY: secretAccessKey,
  S3_ENDPOINT: endpoint,
  S3_FORCE_PATH_STYLE,
  S3_PUBLIC_URL,
} = process.env;
if (!bucket || !accessKeyId || !secretAccessKey) {
  throw new Error('Faltan S3_BUCKET, S3_ACCESS_KEY_ID o S3_SECRET_ACCESS_KEY');
}
const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: S3_FORCE_PATH_STYLE === 'true',
  credentials: { accessKeyId, secretAccessKey },
});
const publicBases = [
  S3_PUBLIC_URL?.replace(/\/+$/, ''),
  `https://${bucket}.s3.${region}.amazonaws.com`,
].filter((b): b is string => !!b);
const newBase = publicBases[0];

// Columns that can hold image URLs (string, string[] or JSON)
const FIELDS: { model: Prisma.ModelName; fields: string[] }[] = [
  { model: 'Project', fields: ['coverUrl', 'mediaUrls'] },
  { model: 'Service', fields: ['coverUrl', 'page'] },
  { model: 'TeamMember', fields: ['photoUrl'] },
  { model: 'Client', fields: ['photoUrl'] },
  { model: 'Testimonial', fields: ['photoUrl'] },
  { model: 'Product', fields: ['coverUrl', 'mediaUrls'] },
  { model: 'SiteSetting', fields: ['value'] },
];

type Delegate = {
  findMany(args: unknown): Promise<Record<string, unknown>[]>;
  update(args: unknown): Promise<unknown>;
};
const delegate = (model: Prisma.ModelName) =>
  (prisma as unknown as Record<string, Delegate>)[model[0].toLowerCase() + model.slice(1)];
const idField = (model: Prisma.ModelName) => (model === 'SiteSetting' ? 'key' : 'id');

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

function replace(value: unknown, map: Map<string, string>): unknown {
  if (typeof value === 'string') return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => replace(v, map));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replace(v, map)]));
  }
  return value;
}

const ownKey = (url: string) => {
  const base = publicBases.find((b) => url.startsWith(`${b}/`));
  if (!base) return null;
  const key = decodeURIComponent(url.slice(base.length + 1).split(/[?#]/)[0]);
  return key.startsWith('incoming/') ? null : key;
};

const exists = (key: string) =>
  s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key })).then(
    () => true,
    () => false,
  );

const stats = { bucket: 0, cloudinary: 0, external: 0, failed: 0, before: 0, after: 0 };
const converted: string[] = []; // original keys, for --delete-originals

async function convertOwn(key: string) {
  const target = webpKey(key);
  const newUrl = `${newBase}/${target}`;
  if (await exists(target)) {
    console.log(`  = ya existe  ${target}`);
    converted.push(key);
    return newUrl;
  }
  const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const input = Buffer.from(await obj.Body!.transformToByteArray());
  const image = sharp(input, { limitInputPixels: MAX_IMAGE_PIXELS, animated: true });
  const output = await toWebp(image, await image.metadata());
  stats.before += input.length;
  stats.after += output.length;
  console.log(
    `  ✓ ${key} → .webp  ${kb(input.length)} → ${kb(output.length)} (${pct(input.length, output.length)})`,
  );
  if (APPLY) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: target,
        Body: output,
        ContentType: 'image/webp',
        CacheControl: CACHE_CONTROL,
      }),
    );
  }
  converted.push(key);
  return newUrl;
}

function convertCloudinary(url: string): string | null {
  const m = CLOUDINARY.exec(url);
  if (!m) return null;
  const [, prefix, rest] = m;
  if (!RASTER.test(rest.split(/[?#]/)[0])) return null;
  // Already has a format or quality transformation in front
  if (/^[^/]*\b[fq]_/.test(rest)) return null;
  return `${prefix}f_webp,q_auto:eco/${rest}`;
}

async function main() {
  console.log(APPLY ? '== Aplicando cambios ==' : '== Simulación (usa --apply para guardar) ==');

  const rows: { model: Prisma.ModelName; fields: string[]; row: Record<string, unknown> }[] = [];
  const urls = new Set<string>();
  for (const { model, fields } of FIELDS) {
    const select = Object.fromEntries([idField(model), ...fields].map((f) => [f, true]));
    for (const row of await delegate(model).findMany({ select })) {
      rows.push({ model, fields, row });
      fields.forEach((f) => strings(row[f]).forEach((s) => /^https?:\/\//.test(s) && urls.add(s)));
    }
  }

  const map = new Map<string, string>();
  for (const url of urls) {
    const path = url.split(/[?#]/)[0];
    const key = ownKey(url);
    try {
      if (key) {
        if (!RASTER.test(key)) continue;
        map.set(url, await convertOwn(key));
        stats.bucket++;
      } else if (CLOUDINARY.test(url)) {
        const next = convertCloudinary(url);
        if (next) {
          console.log(`  ✓ Cloudinary  ${url}`);
          map.set(url, next);
          stats.cloudinary++;
        }
      } else if (RASTER.test(path)) {
        console.log(`  - externa, sin tocar  ${url}`);
        stats.external++;
      }
    } catch (err) {
      console.error(`  ✗ ${url}: ${(err as Error).message}`);
      stats.failed++;
    }
  }

  let updated = 0;
  for (const { model, fields, row } of rows) {
    const data: Record<string, unknown> = {};
    for (const f of fields) {
      const next = replace(row[f], map);
      if (JSON.stringify(next) !== JSON.stringify(row[f])) data[f] = next;
    }
    if (!Object.keys(data).length) continue;
    updated++;
    console.log(`  ↻ ${model} ${row[idField(model)]}: ${Object.keys(data).join(', ')}`);
    if (APPLY) {
      const id = idField(model);
      await delegate(model).update({ where: { [id]: row[id] }, data });
    }
  }

  if (APPLY && DELETE_ORIGINALS && !stats.failed) {
    for (const key of converted) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      console.log(`  🗑 ${key}`);
    }
  } else if (DELETE_ORIGINALS && stats.failed) {
    console.log('Hubo errores: no se borra ningún original.');
  }

  console.log(
    `\nBucket: ${stats.bucket} imágenes (${kb(stats.before)} → ${kb(stats.after)})` +
      ` · Cloudinary: ${stats.cloudinary} · externas sin tocar: ${stats.external}` +
      ` · errores: ${stats.failed} · filas ${APPLY ? 'actualizadas' : 'a actualizar'}: ${updated}`,
  );
}

const kb = (n: number) => `${Math.round(n / 1024)} KB`;
const pct = (a: number, b: number) => `${Math.round((1 - b / a) * 100)}% menos`;

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
