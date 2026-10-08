import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Equals,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LETTERS_PATTERN } from '../../common/text-patterns';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/** Billing details, when the client wants an invoice (issued at month end) */
export class InvoiceDto {
  @ApiProperty({ example: 'Hotel Vida Pura S.A.', description: 'Person or company name' })
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  @Matches(/^[\p{L}\p{M}0-9 .,&'()-]+$/u, {
    message: 'El nombre o razón social tiene caracteres no permitidos',
  })
  name: string;

  @ApiProperty({ example: '0991234567001', description: 'Cédula (10 digits) or RUC (13)' })
  @Transform(trim)
  @Matches(/^\d{10}(\d{3})?$/, { message: 'La cédula debe tener 10 dígitos o el RUC 13' })
  taxId: string;

  @ApiProperty({ example: 'facturacion@hotel.com' })
  @Transform(trim)
  @IsEmail({}, { message: 'El correo para la factura no es válido' })
  @MaxLength(120)
  email: string;

  @ApiProperty({ example: 'Av. Principal 123, Atacames' })
  @Transform(trim)
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @Matches(/^[\p{L}\p{M}0-9 .,#'()\/-]+$/u, {
    message: 'La dirección tiene caracteres no permitidos',
  })
  address: string;
}

/** Client accepting a proforma on its public page */
export class AcceptQuoteDto {
  @ApiProperty({ example: 'María Pérez', description: 'Name typed by the person accepting' })
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Matches(LETTERS_PATTERN, { message: 'El nombre solo puede tener letras' })
  name: string;

  @ApiProperty({ example: true, description: 'Must be true: the terms were read and accepted' })
  @Equals(true, { message: 'Debes aceptar los términos y condiciones' })
  acceptTerms: boolean;

  @ApiProperty({
    example: 'q3Jf0x9mZk1pR2sT4uV6wA',
    description: 'Version the client read (public `version`); a changed quote is refused',
  })
  @IsString()
  @MaxLength(64)
  version: string;

  @ApiPropertyOptional({
    type: InvoiceDto,
    description: 'Present when the client wants an invoice',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceDto)
  invoice?: InvoiceDto;
}
