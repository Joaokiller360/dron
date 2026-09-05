import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Joao Barres' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Quisiera cotizar un video para mi evento.' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ example: 'es', enum: ['es', 'en'] })
  @IsOptional()
  @IsIn(['es', 'en'])
  locale?: string;
}
