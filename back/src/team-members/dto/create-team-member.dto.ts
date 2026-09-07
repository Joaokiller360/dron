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
