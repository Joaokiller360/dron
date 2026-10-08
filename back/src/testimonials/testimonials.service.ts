import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

const CLIENT_FIELDS = { id: true, name: true, photoUrl: true } as const;

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Published ones with the photo and company resolved from the linked client when not set */
  async findPublished() {
    const rows = await this.prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      include: { client: { select: CLIENT_FIELDS } },
    });
    return rows.map(({ client, ...t }) => ({
      ...t,
      photoUrl: t.photoUrl || client?.photoUrl || null,
      org: t.org || client?.name || null,
    }));
  }

  findAllForAdmin() {
    return this.prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' }, include: { client: { select: CLIENT_FIELDS } } });
  }

  async create(dto: CreateTestimonialDto) {
    await this.ensureClient(dto.clientId);
    return this.prisma.testimonial.create({ data: dto, include: { client: { select: CLIENT_FIELDS } } });
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    await this.ensureExists(id);
    await this.ensureClient(dto.clientId);
    return this.prisma.testimonial.update({ where: { id }, data: dto, include: { client: { select: CLIENT_FIELDS } } });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.testimonial.delete({ where: { id } });
  }

  private async ensureClient(clientId?: string | null) {
    if (!clientId) return;
    const found = await this.prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!found) throw new BadRequestException(`El cliente ${clientId} no existe`);
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`El testimonio ${id} no existe`);
    return found;
  }
}
