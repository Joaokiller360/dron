import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { LinkDto } from './link.dto';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'joao-barres' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, dash-separated',
  })
  slug: string;

  @ApiProperty({ example: 'Joao Barres' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Piloto' })
  @IsString()
  @MaxLength(100)
  role: string;

  @ApiProperty({ example: 'https://cdn.example.com/joao.jpg' })
  @IsUrl()
  photoUrl: string;

  @ApiPropertyOptional({
    example: 'Dirige cada producción y vuela las secuencias de alta velocidad.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional({ example: 'Fundó JB.SKYLENS en Esmeraldas...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  story?: string;

  @ApiPropertyOptional({ example: '+40 h' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  stat?: string;

  @ApiPropertyOptional({ example: 'de vuelo certificadas' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  statLabel?: string;

  @ApiPropertyOptional({ example: 'Esmeraldas' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  base?: string;

  @ApiPropertyOptional({ type: [String], example: ['Piloto RPAS', 'Dirección'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];

  @ApiPropertyOptional({ type: [LinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
