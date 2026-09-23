import { Body, Controller, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class ReorderDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];
}

// API resource name → Prisma delegate with a sortOrder column
const RESOURCES = {
  projects: 'project',
  services: 'service',
  'team-members': 'teamMember',
  clients: 'client',
  categories: 'category',
  'legal-pages': 'legalPage',
  promotions: 'promotion',
  testimonials: 'testimonial',
  venues: 'venue',
  products: 'product',
} as const;

@ApiTags('reorder')
@Controller('reorder')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReorderController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch(':resource')
  @ApiOperation({ summary: 'Admin: set sortOrder of a resource from the given id order' })
  async reorder(@Param('resource') resource: string, @Body() dto: ReorderDto) {
    const model = RESOURCES[resource as keyof typeof RESOURCES];
    if (!model) throw new NotFoundException(`Cannot reorder ${resource}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (this.prisma as any)[model];
    await this.prisma.$transaction(
      dto.ids.map((id, index) => delegate.update({ where: { id }, data: { sortOrder: index } })),
    );
    return { resource, count: dto.ids.length };
  }
}
