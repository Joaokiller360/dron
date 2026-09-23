import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'crypto';
import * as sharp from 'sharp';
import { slugify } from '../common/slugify';
import { CompleteUploadDto, PresignUploadDto, UPLOAD_FOLDERS } from './dto/presign-upload.dto';
import { SHARP_FORMAT, UPLOAD_TYPES, UploadType } from './upload-types';

const MB = 1024 * 1024;
const MAX_BYTES = { image: 20 * MB, video: 1024 * MB };
const EXPIRES_SECONDS = 15 * 60;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';
// Rejects decompression bombs (a small file that expands to a huge bitmap)
const MAX_IMAGE_PIXELS = 60_000_000;
const VIDEO_HEAD_BYTES = 64 * 1024;

// Uploads land here first. The prefix is not public in the bucket policy, so
// nothing is served until complete() has checked it.
const INCOMING = 'incoming/';
const KEY_PATTERN = new RegExp(
  `^${INCOMING}(${UPLOAD_FOLDERS.join('|')})/\\d{4}/\\d{2}/[a-f0-9]{8}-[a-z0-9-]+\\.(${[
    ...new Set(Object.values(UPLOAD_TYPES).map((t) => t.ext)),
  ].join('|')})$`,
);

interface S3Config {
  region: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  forcePathStyle: boolean;
  publicUrl?: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3: S3Config;
  private readonly client: S3Client | null;

  constructor(config: ConfigService) {
    this.s3 = config.get<S3Config>('s3')!;
    const { bucket, accessKeyId, secretAccessKey, region, endpoint, forcePathStyle } = this.s3;
    this.client =
      bucket && accessKeyId && secretAccessKey
        ? new S3Client({
            region,
            endpoint,
            forcePathStyle,
            credentials: { accessKeyId, secretAccessKey },
          })
        : null;
  }

  /**
   * Signs a browser-to-bucket POST upload into the private incoming/ area.
   * Size and content type are enforced by S3 through the policy conditions,
   * so the file never passes through this API.
   */
  async presign(dto: PresignUploadDto) {
    const client = this.requireClient();
    const type = UPLOAD_TYPES[dto.contentType];
    if (!type) {
      throw new BadRequestException('Formato no permitido');
    }
    const ext = this.extensionOf(dto.filename);
    if (!type.extensions.includes(ext)) {
      throw new BadRequestException(
        `La extensión ".${ext || '?'}" no coincide con el formato ${dto.contentType}`,
      );
    }
    const max = MAX_BYTES[type.kind];
    if (dto.size > max) {
      throw new BadRequestException(
        `El archivo supera el máximo de ${max / MB} MB para ${type.kind === 'video' ? 'videos' : 'imágenes'}`,
      );
    }

    const key = INCOMING + this.buildKey(dto.folder ?? 'misc', dto.filename, type);
    const { url, fields } = await createPresignedPost(client, {
      Bucket: this.s3.bucket!,
      Key: key,
      Conditions: [['content-length-range', 1, max]],
      Fields: { 'Content-Type': dto.contentType },
      Expires: EXPIRES_SECONDS,
    });

    return { url, fields, key };
  }

  /**
   * Checks an upload's real content and publishes it. Images are decoded and
   * re-encoded (drops anything appended or hidden in the file, plus EXIF/GPS
   * metadata); videos must have a valid container header. Whatever happens,
   * the incoming copy is deleted.
   */
  async complete(dto: CompleteUploadDto) {
    const client = this.requireClient();
    const bucket = this.s3.bucket!;
    const source = dto.key;
    if (!KEY_PATTERN.test(source)) {
      throw new BadRequestException('Clave de subida no válida');
    }
    const target = source.slice(INCOMING.length);

    try {
      const head = await client
        .send(new HeadObjectCommand({ Bucket: bucket, Key: source }))
        .catch(() => {
          throw new BadRequestException('El archivo no existe o la subida caducó');
        });
      const contentType = head.ContentType ?? '';
      const type = UPLOAD_TYPES[contentType];
      if (!type || !source.endsWith(`.${type.ext}`)) {
        throw new BadRequestException('Formato no permitido');
      }
      if ((head.ContentLength ?? 0) > MAX_BYTES[type.kind]) {
        throw new BadRequestException('El archivo supera el tamaño máximo');
      }

      if (type.kind === 'image') {
        await this.publishImage(client, bucket, source, target, contentType, type);
      } else {
        await this.publishVideo(client, bucket, source, target, contentType, type);
      }
      return { publicUrl: `${this.publicBase()}/${target}` };
    } finally {
      await client
        .send(new DeleteObjectCommand({ Bucket: bucket, Key: source }))
        .catch((err: Error) =>
          this.logger.warn(`Could not delete incoming upload ${source}: ${err.message}`),
        );
    }
  }

  private async publishImage(
    client: S3Client,
    bucket: string,
    source: string,
    target: string,
    contentType: string,
    type: UploadType,
  ) {
    const obj = await client.send(new GetObjectCommand({ Bucket: bucket, Key: source }));
    const input = Buffer.from(await obj.Body!.transformToByteArray());
    if (!type.sniff(input)) {
      throw new BadRequestException('El contenido no corresponde a una imagen válida');
    }

    let output: Buffer;
    try {
      const image = sharp(input, {
        failOn: 'error',
        limitInputPixels: MAX_IMAGE_PIXELS,
        animated: true,
      });
      const meta = await image.metadata();
      if (meta.format !== SHARP_FORMAT[contentType]) {
        throw new Error(`format ${meta.format}`);
      }
      // Bake the EXIF orientation in before metadata is dropped (stills only)
      const oriented = (meta.pages ?? 1) > 1 ? image : image.rotate();
      output =
        type.ext === 'jpg'
          ? await oriented.jpeg({ quality: 86, mozjpeg: true }).toBuffer()
          : type.ext === 'png'
            ? await oriented.png({ compressionLevel: 9 }).toBuffer()
            : await oriented.webp({ quality: 86 }).toBuffer();
    } catch (err) {
      this.logger.warn(`Rejected image ${source}: ${(err as Error).message}`);
      throw new BadRequestException('La imagen está dañada o no es válida');
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: target,
        Body: output,
        ContentType: contentType,
        CacheControl: CACHE_CONTROL,
      }),
    );
  }

  private async publishVideo(
    client: S3Client,
    bucket: string,
    source: string,
    target: string,
    contentType: string,
    type: UploadType,
  ) {
    const obj = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: source,
        Range: `bytes=0-${VIDEO_HEAD_BYTES - 1}`,
      }),
    );
    const head = await obj.Body!.transformToByteArray();
    if (!type.sniff(head)) {
      this.logger.warn(`Rejected video ${source}: header does not match ${contentType}`);
      throw new BadRequestException('El contenido no corresponde a un video válido');
    }

    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: target,
        CopySource: `${bucket}/${encodeURIComponent(source).replace(/%2F/g, '/')}`,
        MetadataDirective: 'REPLACE',
        ContentType: contentType,
        CacheControl: CACHE_CONTROL,
      }),
    );
  }

  private requireClient() {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Las subidas no están configuradas (faltan variables S3_* en la API)',
      );
    }
    return this.client;
  }

  private extensionOf(filename: string) {
    const dot = filename.lastIndexOf('.');
    return dot > 0
      ? filename
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
      : '';
  }

  // projects/2026/09/3f2a9c1e-halloween-party.mp4 (extension from the checked
  // content type, never from the client's filename)
  private buildKey(folder: string, filename: string, type: UploadType) {
    const dot = filename.lastIndexOf('.');
    const base = slugify(dot > 0 ? filename.slice(0, dot) : filename).slice(0, 60) || 'archivo';
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const id = randomUUID().slice(0, 8);
    return `${folder}/${now.getUTCFullYear()}/${month}/${id}-${base}.${type.ext}`;
  }

  private publicBase() {
    const { publicUrl, bucket, region } = this.s3;
    if (publicUrl) return publicUrl.replace(/\/+$/, '');
    return `https://${bucket}.s3.${region}.amazonaws.com`;
  }
}
