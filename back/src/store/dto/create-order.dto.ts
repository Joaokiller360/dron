import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  NAME_PATTERN,
  PHONE_PATTERN,
  PLACE_PATTERN,
  TEXT_PATTERN,
} from '../../common/text-patterns';

export class OrderLineDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  items: OrderLineDto[];

  @ApiProperty({ example: 'Joao Barres' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(NAME_PATTERN, { message: 'name contains invalid characters' })
  name: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: 'phone contains invalid characters' })
  phone: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Av. Libertad y Manabí, casa 12' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @Matches(TEXT_PATTERN, { message: 'address contains invalid characters' })
  address: string;

  @ApiProperty({ example: 'Esmeraldas' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(PLACE_PATTERN, { message: 'city contains invalid characters' })
  city: string;

  @ApiPropertyOptional({ example: 'Entregar por la tarde, por favor.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Matches(TEXT_PATTERN, { message: 'note contains invalid characters' })
  note?: string;

  @ApiPropertyOptional({ example: 'es', enum: ['es', 'en'] })
  @IsOptional()
  @IsIn(['es', 'en'])
  locale?: string;
}
