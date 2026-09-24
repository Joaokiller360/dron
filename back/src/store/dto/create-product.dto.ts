import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
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
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

/** One row of the product details table */
export class ProductSpecDto {
  @ApiProperty({ example: 'Medidas' })
  @IsString()
  @MaxLength(60)
  label: string;

  @ApiProperty({ example: '30 × 40 cm' })
  @IsString()
  @MaxLength(200)
  value: string;
}

/** One value of an option and what it adds to the base price */
export class ProductOptionValueDto {
  @ApiProperty({ example: '50 × 70 cm' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label: string;

  @ApiProperty({ example: 1500, description: 'Added to the base price, in cents (0 = same price)' })
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceCents: number;
}

/** A choice that changes the price: size, color, material… */
export class ProductOptionDto {
  @ApiProperty({ example: 'Medida' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name: string;

  @ApiProperty({ type: [ProductOptionValueDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductOptionValueDto)
  values: ProductOptionValueDto[];
}

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

  @ApiPropertyOptional({ type: [String], description: 'Extra gallery photos' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ type: [ProductSpecDto], description: 'Measurements and other details' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductSpecDto)
  specs?: ProductSpecDto[];

  @ApiPropertyOptional({
    type: [ProductOptionDto],
    description: 'Options that change the price (size, color, material…)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options?: ProductOptionDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
