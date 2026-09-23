import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = this.slugFor(dto.name);
    await this.ensureNameFree(dto.type, slug, dto.name);
    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  findAll(type?: CategoryType) {
    return this.prisma.category.findMany({
      where: type ? { type } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.ensureExists(id);
    let slug: string | undefined;
    if (dto.name !== undefined) {
      slug = this.slugFor(dto.name);
      await this.ensureNameFree(dto.type ?? category.type, slug, dto.name, id);
    }
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
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
        `La categoría "${category.name}" está en uso por ${inUse} elemento(s). Cámbialos de categoría o elimínalos primero.`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }
    return category;
  }

  private slugFor(name: string) {
    const slug = slugify(name);
    if (!slug) {
      throw new BadRequestException('El nombre de la categoría debe tener letras o números');
    }
    return slug;
  }

  // Names are unique per type (by slug, so "Bodas" and "bodas" collide)
  private async ensureNameFree(type: CategoryType, slug: string, name: string, exceptId?: string) {
    const existing = await this.prisma.category.findUnique({
      where: { type_slug: { type, slug } },
    });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`Ya existe una categoría llamada "${name}"`);
    }
  }
}
