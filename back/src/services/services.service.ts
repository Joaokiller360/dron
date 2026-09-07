import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto, include: { category: true } });
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
    return this.prisma.service.update({ where: { id }, data: dto, include: { category: true } });
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
}
