import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
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

  @ApiProperty({ description: 'id of a Category with type=SERVICE' })
  @IsUUID()
  categoryId: string;

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
  href?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
