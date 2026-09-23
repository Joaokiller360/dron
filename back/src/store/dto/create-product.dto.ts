import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'foto-aerea-impresa-a3' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, dash-separated',
  })
  slug: string;

  @ApiProperty({ example: 'Foto aérea impresa A3' })
  @IsString()
  @MaxLength(150)
  nameEs: string;

  @ApiPropertyOptional({ example: 'A3 printed aerial photo' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionEs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionEn?: string;

  @ApiProperty({ example: 2500, description: 'Price in cents (USD)' })
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceCents: number;

  @ApiPropertyOptional({ example: 3000, description: 'Crossed-out previous price in cents' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  compareAtCents?: number;

  @ApiPropertyOptional({ example: 10, description: 'Units available; omit/null for unlimited' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/product.jpg' })
  @IsOptional()
  @ValidateIf((o: CreateProductDto) => o.coverUrl !== '')
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
