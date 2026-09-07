import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { LinkDto } from '../../team-members/dto/link.dto';

export class CreateClientDto {
  @ApiProperty({ example: 'marina-ecovida' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, dash-separated',
  })
  slug: string;

  @ApiProperty({ example: 'Marina Ecovida' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ description: 'id of a Category with type=CLIENT' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'https://cdn.example.com/marina.jpg' })
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
