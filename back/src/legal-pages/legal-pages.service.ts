import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalPageDto } from './dto/create-legal-page.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';

@Injectable()
export class LegalPagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLegalPageDto) {
    const { content, ...rest } = dto;
    return this.prisma.legalPage.create({
      data: { ...rest, content: content as unknown as Prisma.InputJsonValue },
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

  // `content` is a free-form JSON array; cast it to the Prisma JSON input type.
  private toPrismaData<T extends { content?: unknown[] }>(dto: T) {
    const { content, ...rest } = dto;
    return {
      ...rest,
      ...(content !== undefined
        ? { content: content as unknown as Prisma.InputJsonValue }
        : {}),
    };
  }

  private async ensureExists(id: string) {
    const page = await this.prisma.legalPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Legal page ${id} not found`);
    }
    return page;
  }
}
