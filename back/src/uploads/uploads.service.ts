import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'crypto';
import { slugify } from '../common/slugify';
import { PresignUploadDto } from './dto/presign-upload.dto';

const MB = 1024 * 1024;
const MAX_BYTES = { image: 20 * MB, video: 1024 * MB };
const EXPIRES_SECONDS = 15 * 60;

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
   * Signs a browser-to-bucket POST upload. The size and content type are
   * enforced by S3 itself through the policy conditions, so the file never
   * passes through this API.
   */
  async presign(dto: PresignUploadDto) {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Las subidas no están configuradas (faltan variables S3_* en la API)',
      );
    }
    const kind = dto.contentType.startsWith('video/') ? 'video' : 'image';
    const max = MAX_BYTES[kind];
    if (dto.size > max) {
      throw new BadRequestException(
        `El archivo supera el máximo de ${max / MB} MB para ${kind === 'video' ? 'videos' : 'imágenes'}`,
      );
    }

    const key = this.buildKey(dto.folder ?? 'misc', dto.filename);
    const { url, fields } = await createPresignedPost(this.client, {
      Bucket: this.s3.bucket!,
      Key: key,
      Conditions: [['content-length-range', 1, max]],
      Fields: {
        'Content-Type': dto.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      Expires: EXPIRES_SECONDS,
    });

    return { url, fields, key, publicUrl: `${this.publicBase()}/${key}` };
  }

  // projects/2026/09/3f2a9c1e-halloween-party.mp4
  private buildKey(folder: string, filename: string) {
    const dot = filename.lastIndexOf('.');
    const ext =
      dot > 0
        ? filename
            .slice(dot + 1)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
        : '';
    const base = slugify(dot > 0 ? filename.slice(0, dot) : filename).slice(0, 60) || 'archivo';
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const id = randomUUID().slice(0, 8);
    return `${folder}/${now.getUTCFullYear()}/${month}/${id}-${base}${ext ? `.${ext}` : ''}`;
  }

  private publicBase() {
    const { publicUrl, bucket, region } = this.s3;
    if (publicUrl) return publicUrl.replace(/\/+$/, '');
    return `https://${bucket}.s3.${region}.amazonaws.com`;
  }
}
