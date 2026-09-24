import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PLACE_PATTERN } from '../../common/text-patterns';

export class CreateVenueDto {
  @ApiProperty({ example: 'Marina Ecovida' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(PLACE_PATTERN, { message: 'El nombre tiene caracteres no permitidos' })
  name: string;

  @ApiProperty({ example: 'Esmeraldas' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(PLACE_PATTERN, { message: 'La ciudad tiene caracteres no permitidos' })
  city: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
