import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: this.toPrismaData(dto),
      include: { category: true },
    });
  }

  // `page` is a free-form JSON blob (the PageServices prop tree); cast it to the
  // Prisma JSON input type without dragging the rest of the DTO through `any`.
  private toPrismaData<T extends { page?: Record<string, unknown> }>(dto: T) {
    const { page, ...rest } = dto;
    return {
      ...rest,
      ...(page !== undefined
        ? { page: page as unknown as Prisma.InputJsonValue }
        : {}),
    };
  }

  findBySlug(slug: string) {
    return this.ensureBySlug(slug);
  }

  findPublished(categoryId?: string) {
    return this.prisma.service.findMany({
      where: { published: true, ...(categoryId ? { categoryId } : {}) },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  }

  findAllForAdmin(categoryId?: string) {
    return this.prisma.service.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.ensureExists(id);
    return this.prisma.service.update({
      where: { id },
      data: this.toPrismaData(dto),
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.service.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
    return service;
  }

  private async ensureBySlug(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!service || !service.published) {
      throw new NotFoundException(`Service "${slug}" not found`);
    }
    return service;
  }
}
