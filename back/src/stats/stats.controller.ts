import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Admin: counts for the dashboard overview' })
  async overview() {
    const p = this.prisma;
    const pair = async (
      total: Promise<number>,
      published: Promise<number>,
    ): Promise<{ total: number; published: number }> => {
      const [t, pub] = await Promise.all([total, published]);
      return { total: t, published: pub };
    };
    const [messages, newMessages, projects, services, team, clients, testimonials, promotions] =
      await Promise.all([
        p.contactMessage.count(),
        p.contactMessage.count({ where: { status: 'NEW' } }),
        pair(p.project.count(), p.project.count({ where: { published: true } })),
        pair(p.service.count(), p.service.count({ where: { published: true } })),
        pair(p.teamMember.count(), p.teamMember.count({ where: { published: true } })),
        pair(p.client.count(), p.client.count({ where: { published: true } })),
        pair(p.testimonial.count(), p.testimonial.count({ where: { published: true } })),
        pair(p.promotion.count(), p.promotion.count({ where: { active: true } })),
      ]);
    return {
      messages: { total: messages, new: newMessages },
      projects,
      services,
      team,
      clients,
      testimonials,
      promotions,
    };
  }
}
