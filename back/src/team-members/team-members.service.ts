import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTeamMemberDto) {
    const { links, ...rest } = dto;
    return this.prisma.teamMember.create({
      data: { ...rest, links: (links ?? []) as unknown as Prisma.InputJsonValue },
    });
  }

  findPublished() {
    return this.prisma.teamMember.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    await this.ensureExists(id);
    const { links, ...rest } = dto;
    return this.prisma.teamMember.update({
      where: { id },
      data: {
        ...rest,
        ...(links ? { links: links as unknown as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.teamMember.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException(`El miembro del equipo ${id} no existe`);
    }
    return member;
  }
}
