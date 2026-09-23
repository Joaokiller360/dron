import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export const UPLOAD_FOLDERS = ['projects', 'services', 'team', 'clients', 'misc'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export class PresignUploadDto {
  @ApiProperty({ example: 'halloween-party.mp4' })
  @IsString()
  @MaxLength(200)
  filename: string;

  @ApiProperty({ example: 'video/mp4' })
  @Matches(/^(image|video)\/[\w.+-]+$/, { message: 'Solo se permiten imágenes o videos' })
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
