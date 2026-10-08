import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, IsDateString, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { LETTERS_PATTERN } from '../../common/text-patterns';

/** Client accepting a proforma on its public page */
export class AcceptQuoteDto {
  @ApiProperty({ example: 'María Pérez', description: 'Name typed by the person accepting' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Matches(LETTERS_PATTERN, { message: 'El nombre solo puede tener letras' })
  name: string;

  @ApiProperty({ example: true, description: 'Must be true: the terms were read and accepted' })
  @Equals(true, { message: 'Debes aceptar los términos y condiciones' })
  acceptTerms: boolean;

  @ApiProperty({
    example: '2026-10-08T16:40:00.000Z',
    description: 'Version the client read (public `version`); a changed quote is refused',
  })
  @IsDateString()
  version: string;
}
