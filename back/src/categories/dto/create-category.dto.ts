import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Bodas' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.PROJECT })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
