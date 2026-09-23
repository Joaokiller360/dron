import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublished() {
    return this.prisma.venue.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.venue.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  create(dto: CreateVenueDto) {
    return this.prisma.venue.create({ data: dto });
  }

  async update(id: string, dto: UpdateVenueDto) {
    await this.ensureExists(id);
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.venue.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.venue.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Venue ${id} not found`);
    return found;
  }
}
