import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { StoreDiscount, toStoreDiscount } from './store-discounts';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  DEFAULT_PROMOTION_SETTINGS,
  PromotionSettings,
  PromotionSettingsDto,
} from './dto/promotion-settings.dto';

const SETTINGS_KEY = 'promotions';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<PromotionSettings> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    return { ...DEFAULT_PROMOTION_SETTINGS, ...((row?.value as Partial<PromotionSettings>) ?? {}) };
  }

  async updateSettings(dto: PromotionSettingsDto) {
    const value = { ...(await this.getSettings()), ...dto };
    await this.prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: value as Prisma.InputJsonValue },
      create: { key: SETTINGS_KEY, value: value as Prisma.InputJsonValue },
    });
    return value;
  }

  /** Public payload: switches + active, non-expired offers (empty when the module is off) */
  async findPublic() {
    const settings = await this.getSettings();
    if (!settings.enabled) return { settings, items: [] };
    const items = await this.prisma.promotion.findMany({
      where: { active: true, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
      orderBy: { sortOrder: 'asc' },
    });
    return { settings, items };
  }

  /** Discounts running now (module and store switch on, active, not expired) */
  async activeStoreDiscounts(): Promise<StoreDiscount[]> {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.store) return [];
    const items = await this.prisma.promotion.findMany({
      where: {
        active: true,
        discountType: { not: null },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      orderBy: { sortOrder: 'asc' },
    });
    return items.map(toStoreDiscount).filter((d): d is StoreDiscount => d !== null);
  }

  findAllForAdmin() {
    return this.prisma.promotion.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({ data: this.withDiscount(dto) });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const current = await this.ensureExists(id);
    return this.prisma.promotion.update({ where: { id }, data: this.withDiscount(dto, current) });
  }

  /** Keeps type and value consistent: no type = no value; a percent tops out at 90 */
  private withDiscount<T extends UpdatePromotionDto>(
    dto: T,
    current?: { discountType: string | null; discountValue: number | null },
  ): T {
    const type = dto.discountType !== undefined ? dto.discountType : current?.discountType;
    const value = dto.discountValue !== undefined ? dto.discountValue : current?.discountValue;
    if (!type) return { ...dto, discountType: null, discountValue: null };
    if (!value) throw new BadRequestException('Indica el valor del descuento');
    if (type === 'PERCENT' && value > 90) {
      throw new BadRequestException('El descuento en porcentaje admite hasta 90%');
    }
    return dto;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.promotion.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.promotion.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`La promoción ${id} no existe`);
    return found;
  }
}
