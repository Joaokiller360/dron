import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateClientDto) {
    const { links, ...rest } = dto;
    return this.prisma.client.create({
      data: { ...rest, links: (links ?? []) as unknown as Prisma.InputJsonValue },
      include: { category: true },
    });
  }

  findPublished(categoryId?: string) {
    return this.prisma.client.findMany({
      where: { published: true, ...(categoryId ? { categoryId } : {}) },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  }

  findAllForAdmin(categoryId?: string) {
    return this.prisma.client.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.ensureExists(id);
    const { links, ...rest } = dto;
    return this.prisma.client.update({
      where: { id },
      data: {
        ...rest,
        ...(links ? { links: links as unknown as Prisma.InputJsonValue } : {}),
      },
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.client.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return client;
  }
}
