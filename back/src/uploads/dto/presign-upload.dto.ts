import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { ALLOWED_CONTENT_TYPES } from '../upload-types';

export const UPLOAD_FOLDERS = ['projects', 'services', 'team', 'clients', 'products', 'misc'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export class PresignUploadDto {
  @ApiProperty({ example: 'halloween-party.mp4' })
  @IsString()
  @MaxLength(200)
  filename: string;

  @ApiProperty({ example: 'video/mp4', enum: ALLOWED_CONTENT_TYPES })
  @IsIn(ALLOWED_CONTENT_TYPES, {
    message: 'Formato no permitido. Imágenes: JPG, PNG o WebP. Videos: MP4, MOV o WebM',
  })
  contentType: string;

  @ApiProperty({ example: 52428800, description: 'File size in bytes' })
  @IsInt()
  @Min(1)
  size: number;

  @ApiPropertyOptional({ enum: UPLOAD_FOLDERS, default: 'misc' })
  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder?: UploadFolder;
}

export class CompleteUploadDto {
  @ApiProperty({ example: 'incoming/projects/2026/09/3f2a9c1e-halloween-party.mp4' })
  @IsString()
  @MaxLength(300)
  @Matches(/^incoming\//)
  key: string;
}
