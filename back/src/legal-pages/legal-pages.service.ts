import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalPageDto } from './dto/create-legal-page.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';

@Injectable()
export class LegalPagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLegalPageDto) {
    const existing = await this.prisma.legalPage.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(
        `Ya existe una página con la dirección /legal/${dto.slug}. Usa otro título.`,
      );
    }
    const { content, ...rest } = dto;
    return this.prisma.legalPage.create({
      data: { ...rest, content: this.toJson(content) },
    });
  }

  findPublished() {
    return this.prisma.legalPage.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.legalPage.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.legalPage.findUnique({ where: { slug } });
    if (!page || !page.published) {
      throw new NotFoundException(`Legal page "${slug}" not found`);
    }
    return page;
  }

  async update(id: string, dto: UpdateLegalPageDto) {
    await this.ensureExists(id);
    return this.prisma.legalPage.update({
      where: { id },
      data: this.toPrismaData(dto),
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.legalPage.delete({ where: { id } });
  }

  private toPrismaData<T extends { content?: unknown[] }>(dto: T) {
    const { content, ...rest } = dto;
    return { ...rest, ...(content !== undefined ? { content: this.toJson(content) } : {}) };
  }

  // The validated DTOs are class instances; store them as plain JSON
  private toJson(content: unknown[]) {
    return JSON.parse(JSON.stringify(content)) as Prisma.InputJsonValue;
  }

  private async ensureExists(id: string) {
    const page = await this.prisma.legalPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('La página legal no existe');
    }
    return page;
  }
}
