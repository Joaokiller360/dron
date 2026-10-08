import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { TEXT_PATTERN } from '../../common/text-patterns';

/** Client rejecting a proforma on its public page */
export class RejectQuoteDto {
  @ApiPropertyOptional({ example: 'El presupuesto supera lo que teníamos previsto.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Matches(TEXT_PATTERN, { message: 'El motivo tiene caracteres no permitidos' })
  reason?: string;
}
