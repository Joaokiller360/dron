import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Pack Boda Completa' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({
    example: 'Dos horas de vuelo, video editado de 3 minutos y fotos aéreas.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  detail?: string;

  @ApiPropertyOptional({ example: '-20%' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  badge?: string;

  @ApiPropertyOptional({ example: 'Hasta 30 sep' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  untilLabel?: string;

  @ApiPropertyOptional({ example: '$280' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  price?: string;

  @ApiPropertyOptional({ example: '$350' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  oldPrice?: string;

  @ApiPropertyOptional({
    example: 'events-and-live-broadcasting',
    description: 'Service slug that shows the badge',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  serviceSlug?: string;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
