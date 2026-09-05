import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactDto) {
    return this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        message: dto.message,
        locale: dto.locale ?? 'es',
      },
    });
  }

  findAll(status?: ContactStatus) {
    return this.prisma.contactMessage.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Contact message ${id} not found`);
    }
    return message;
  }

  async updateStatus(id: string, status: ContactStatus) {
    await this.findOne(id);
    return this.prisma.contactMessage.update({ where: { id }, data: { status } });
  }
}
