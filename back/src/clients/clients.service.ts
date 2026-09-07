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
    });
  }

  findPublished() {
    return this.prisma.client.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.client.findMany({ orderBy: { sortOrder: 'asc' } });
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
