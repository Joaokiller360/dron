import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.category.findUnique({
      where: { type_slug: { type: dto.type, slug } },
    });
    if (existing) {
      throw new ConflictException(`A ${dto.type} category named "${dto.name}" already exists`);
    }
    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  findAll(type?: CategoryType) {
    return this.prisma.category.findMany({
      where: type ? { type } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(dto.name ? { slug: slugify(dto.name) } : {}) },
    });
  }

  async remove(id: string) {
    const category = await this.ensureExists(id);
    const [projects, clients, services] = await Promise.all([
      this.prisma.project.count({ where: { categoryId: id } }),
      this.prisma.client.count({ where: { categoryId: id } }),
      this.prisma.service.count({ where: { categoryId: id } }),
    ]);
    const inUse = projects + clients + services;
    if (inUse > 0) {
      throw new ConflictException(
        `Category "${category.name}" is used by ${inUse} item(s); reassign or delete them first`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }
}
