import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

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
      throw new NotFoundException(`El mensaje ${id} no existe`);
    }
    return message;
  }

  async updateStatus(id: string, status: ContactStatus) {
    await this.findOne(id);
    return this.prisma.contactMessage.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contactMessage.delete({ where: { id } });
  }

  /**
   * Emails the admin's reply to the sender via Resend. Replies from the client
   * go to the contact email set in the dashboard. The original request is
   * quoted below the reply.
   */
  async reply(id: string, dto: ReplyContactDto) {
    const message = await this.findOne(id);
    const apiKey = this.config.get<string>('resend.apiKey');
    const from = this.config.get<string>('resend.from');
    if (!apiKey || !from) {
      throw new ServiceUnavailableException(
        'El correo no está configurado: agrega RESEND_API_KEY y RESEND_FROM a la API y reiníciala',
      );
    }
    const { email: replyTo } = await this.settings.getContact();

    const quoted = message.message
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n');
    const text = `${dto.body}\n\n---\n${message.name} escribió:\n${quoted}`;
    const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p style="white-space:pre-wrap;margin:0 0 24px">${escapeHtml(dto.body)}</p>
<div style="border-left:3px solid #34d17a;padding:4px 0 4px 14px;color:#555;font-size:13.5px">
<p style="margin:0 0 6px;font-weight:600">${escapeHtml(message.name)} escribió:</p>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(message.message)}</p>
</div>
</div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [message.email],
        reply_to: replyTo,
        subject: dto.subject,
        text,
        html,
      }),
    });
    const result = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      this.logger.error(`Resend rejected reply to ${id}: ${res.status} ${result.message ?? ''}`);
      throw new BadGatewayException(result.message ?? 'El proveedor de correo rechazó el mensaje');
    }

    if (message.status === ContactStatus.NEW) {
      await this.prisma.contactMessage.update({
        where: { id },
        data: { status: ContactStatus.READ },
      });
    }
    return { id: result.id, to: message.email };
  }
}
