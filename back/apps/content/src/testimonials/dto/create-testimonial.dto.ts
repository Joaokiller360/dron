import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Las tomas del hotel superaron lo que esperábamos.' })
  @IsString()
  @MinLength(5)
  @MaxLength(600)
  quote: string;

  @ApiProperty({ example: 'María Pérez' })
  @IsString()
  @MaxLength(100)
  author: string;

  @ApiPropertyOptional({ example: 'Hotel · Atacames' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  org?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
