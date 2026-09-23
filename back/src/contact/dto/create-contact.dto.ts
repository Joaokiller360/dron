import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { NAME_PATTERN, PHONE_PATTERN, TEXT_PATTERN } from '../../common/text-patterns';

export class CreateContactDto {
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

  @ApiProperty({ example: 'Quisiera cotizar un video para mi evento.' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  @Matches(TEXT_PATTERN, { message: 'message contains invalid characters' })
  message: string;

  @ApiPropertyOptional({ example: 'es', enum: ['es', 'en'] })
  @IsOptional()
  @IsIn(['es', 'en'])
  locale?: string;
}
