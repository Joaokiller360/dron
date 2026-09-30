import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { InternalClient } from '@app/common/internal/internal-client';

/** Store counts, from the store service (GET /internal/store/stats) */
interface StoreStats {
  products: { total: number; published: number };
  orders: { total: number; toShip: number; toVerify: number };
}

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  private readonly logger = new Logger(StatsController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly internal: InternalClient,
  ) {}

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
    const [
      messages,
      newMessages,
      projects,
      services,
      team,
      clients,
      testimonials,
      promotions,
      store,
    ] = await Promise.all([
      p.contactMessage.count(),
      p.contactMessage.count({ where: { status: 'NEW' } }),
      pair(p.project.count(), p.project.count({ where: { published: true } })),
      pair(p.service.count(), p.service.count({ where: { published: true } })),
      pair(p.teamMember.count(), p.teamMember.count({ where: { published: true } })),
      pair(p.client.count(), p.client.count({ where: { published: true } })),
      pair(p.testimonial.count(), p.testimonial.count({ where: { published: true } })),
      pair(p.promotion.count(), p.promotion.count({ where: { active: true } })),
      // The overview still loads when the store service is down: its cards show "–"
      this.internal.get<StoreStats>('store', 'store/stats').catch((error: Error) => {
        this.logger.warn(`Store stats unavailable: ${error.message}`);
        return null;
      }),
    ]);
    return {
      messages: { total: messages, new: newMessages },
      projects,
      services,
      team,
      clients,
      testimonials,
      promotions,
      products: store?.products ?? null,
      orders: store?.orders ?? null,
    };
  }
}
