import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
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

  findAllForAdmin() {
    return this.prisma.promotion.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({ data: dto });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.ensureExists(id);
    return this.prisma.promotion.update({ where: { id }, data: dto });
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
