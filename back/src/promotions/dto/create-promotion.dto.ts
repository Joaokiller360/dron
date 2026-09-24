import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { DISCOUNT_TYPES, type DiscountType } from '../store-discounts';

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

  @ApiPropertyOptional({
    enum: DISCOUNT_TYPES,
    nullable: true,
    description: 'Store discount: PERCENT or FIXED (cents); null = display only',
  })
  @IsOptional()
  @IsIn(DISCOUNT_TYPES)
  discountType?: DiscountType | null;

  @ApiPropertyOptional({ example: 20, description: 'Percent (1–90) or cents off each unit' })
  // Checked whenever sent (updates may change only the value); cleared with the type
  @ValidateIf((o: CreatePromotionDto) => o.discountValue != null)
  @IsInt()
  @Min(1)
  @Max(10000000)
  discountValue?: number | null;

  @ApiPropertyOptional({ type: [String], description: 'Discounted products; empty = all' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  productIds?: string[];

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
