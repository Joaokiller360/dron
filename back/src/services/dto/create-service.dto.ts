import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SAFE_HREF_PATTERN } from '../../common/text-patterns';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'fotografia-aerea' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, dash-separated',
  })
  slug: string;

  @ApiPropertyOptional({ description: 'id of a Category with type=SERVICE' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 'Fotografía aérea' })
  @IsString()
  @MaxLength(150)
  titleEs: string;

  @ApiPropertyOptional({ example: 'Aerial photography' })
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

  @ApiProperty({ example: 'https://cdn.example.com/servicio.jpg' })
  @IsUrl()
  coverUrl: string;

  @ApiPropertyOptional({
    example: '/contact',
    description: 'Internal path or external URL for the CTA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(SAFE_HREF_PATTERN, { message: 'href must be an http(s) URL or a path starting with /' })
  href?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    default: false,
    description: 'If true, /services/<slug> renders a full page from `page`',
  })
  @IsOptional()
  @IsBoolean()
  isPage?: boolean;

  @ApiPropertyOptional({
    description: 'Full PageServices prop tree (D, Content, CalltoAction, ...)',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  page?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'Film and TV Production | JB.SKYLENS' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
