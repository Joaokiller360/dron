import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// Shape of a page's `content`, validated field by field so the public page
// always receives what it knows how to render

export class LegalListDto {
  @ApiPropertyOptional({ example: '4.1 Condiciones de Reserva' })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'El encabezado de una sublista admite hasta 300 caracteres' })
  header?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(10000, { each: true, message: 'Cada párrafo admite hasta 10000 caracteres' })
  description?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(5000, { each: true, message: 'Cada ítem admite hasta 5000 caracteres' })
  items: string[];
}

export class LegalSectionDto {
  @ApiPropertyOptional({ example: '2. OBJETO DEL CONTRATO' })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'El encabezado de una sección admite hasta 300 caracteres' })
  heading?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(10000, { each: true, message: 'Cada párrafo admite hasta 10000 caracteres' })
  text?: string[];

  @ApiPropertyOptional({ type: [LegalListDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => LegalListDto)
  lists?: LegalListDto[];
}

export class CreateLegalPageDto {
  @ApiProperty({ example: 'terms-and-conditions' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'La dirección (slug) solo admite minúsculas, números y guiones',
  })
  @MaxLength(120)
  slug: string;

  @ApiProperty({ example: 'Términos y Condiciones' })
  @IsString()
  @MaxLength(200)
  titleEs: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEn?: string;

  @ApiPropertyOptional({ example: 'Nuestros' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @ApiPropertyOptional({ example: '01 de Mayo del 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastUpdate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200, { message: 'Máximo 200 palabras a resaltar' })
  @IsString({ each: true })
  @MaxLength(120, { each: true, message: 'Cada palabra a resaltar admite hasta 120 caracteres' })
  keywords?: string[];

  @ApiProperty({ type: [LegalSectionDto] })
  @IsArray()
  @ArrayMaxSize(100, { message: 'Máximo 100 secciones' })
  @ValidateNested({ each: true })
  @Type(() => LegalSectionDto)
  content: LegalSectionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;
}
