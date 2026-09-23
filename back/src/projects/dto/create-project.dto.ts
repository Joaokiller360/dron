import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'boda-maria-y-juan' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, dash-separated',
  })
  slug: string;

  @ApiProperty({ description: 'id of a Category with type=PROJECT' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Boda de María y Juan' })
  @IsString()
  @MaxLength(150)
  titleEs: string;

  @ApiPropertyOptional({ example: 'María and Juan Wedding' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/cover.jpg',
    description: 'Optional: the site falls back to the video thumbnail (YouTube / Cloudinary)',
  })
  @IsOptional()
  @ValidateIf((o: CreateProjectDto) => o.coverUrl !== '')
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({
    example: 'https://instagram.com/reel/...',
    description: 'External link (e.g. Instagram reel) or internal path for the "view" button',
  })
  @IsOptional()
  @IsString()
  href?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
