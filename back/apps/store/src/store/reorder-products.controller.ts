import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class ReorderDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];
}

/** Products' share of /reorder/:resource (the rest lives in the content service) */
@ApiTags('reorder')
@Controller('reorder')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReorderProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('products')
  @ApiOperation({ summary: 'Admin: set sortOrder of products from the given id order' })
  async reorder(@Body() dto: ReorderDto) {
    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.product.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    return { resource: 'products', count: dto.ids.length };
  }
}
