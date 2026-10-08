import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength } from 'class-validator';

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

  @ApiPropertyOptional({ example: 'https://cdn.example.com/maria.jpg', description: 'Own photo; when empty the linked client photo is used' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  photoUrl?: string | null;

  @ApiPropertyOptional({ description: 'Existing client this testimonial comes from' })
  @IsOptional()
  @IsUUID()
  clientId?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
