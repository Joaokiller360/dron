import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ContactInfo, ContactInfoDto, DEFAULT_CONTACT_INFO } from './dto/contact-info.dto';

const CONTACT_KEY = 'contact';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getContact(): Promise<ContactInfo> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: CONTACT_KEY } });
    return { ...DEFAULT_CONTACT_INFO, ...((row?.value as Partial<ContactInfo>) ?? {}) };
  }

  async updateContact(dto: ContactInfoDto) {
    const value = { ...(await this.getContact()), ...dto };
    await this.prisma.siteSetting.upsert({
      where: { key: CONTACT_KEY },
      update: { value: value as Prisma.InputJsonValue },
      create: { key: CONTACT_KEY, value: value as Prisma.InputJsonValue },
    });
    return value;
  }
}
