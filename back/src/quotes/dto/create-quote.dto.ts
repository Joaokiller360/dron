import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PHONE_PATTERN } from '../../common/text-patterns';

export class QuoteItemDto {
  @ApiProperty({ example: 'Video aéreo con dron 4K · 2 horas de vuelo' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  description: string;

  @ApiProperty({ example: 1, description: 'Up to 2 decimals (e.g. 1.5 hours)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100_000)
  quantity: number;

  @ApiProperty({ example: 25000, description: 'Unit price in cents (USD)' })
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  unitCents: number;
}

export class CreateQuoteDto {
  @ApiProperty({ example: 'María Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  clientName: string;

  @ApiPropertyOptional({ example: 'Hotel Vida Pura' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientCompany?: string | null;

  @ApiPropertyOptional({ example: '0991234567001', description: 'Cédula or RUC' })
  @IsOptional()
  @Matches(/^[0-9A-Za-z-]{5,20}$/, { message: 'La cédula o RUC no es válida' })
  clientTaxId?: string | null;

  @ApiPropertyOptional({ example: 'maria@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  clientEmail?: string | null;

  @ApiPropertyOptional({ example: '099 123 4567' })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: 'El teléfono tiene caracteres no permitidos' })
  clientPhone?: string | null;

  @ApiProperty({ type: [QuoteItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];

  @ApiPropertyOptional({ default: 0, description: 'Cents off the subtotal, before tax' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  discountCents?: number;

  // Ignored: quotes are priced without IVA, which is added on acceptance when the
  // client asks for an invoice. Still accepted so older dashboards keep working.
  @ApiPropertyOptional({
    deprecated: true,
    description: 'Ignored (IVA comes from the invoice choice)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  taxPercent?: number;

  @ApiPropertyOptional({ example: '50% de anticipo, saldo a la entrega. Entrega en 7 días.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateString()
  validUntil?: string | null;
}
