import { Get } from '@nestjs/common';
import { InternalController } from '@app/common/internal/internal.guard';
import { PrismaService } from '../prisma/prisma.service';

/** What the content service reads from the store (dashboard overview) */
@InternalController('store')
export class StoreInternalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const p = this.prisma;
    const [products, published, orders, toShip, toVerify] = await Promise.all([
      p.product.count(),
      p.product.count({ where: { published: true } }),
      p.order.count(),
      p.order.count({ where: { status: 'PAID' } }),
      p.order.count({ where: { status: 'PENDING_PAYMENT', paymentMethod: 'TRANSFER' } }),
    ]);
    return {
      products: { total: products, published },
      orders: { total: orders, toShip, toVerify },
    };
  }
}
