import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  findPublished(category?: ProjectCategory) {
    return this.prisma.project.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllForAdmin(category?: ProjectCategory) {
    return this.prisma.project.findMany({
      where: category ? { category } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({ where: { slug } });
    if (!project) {
      throw new NotFoundException(`Project "${slug}" not found`);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureExists(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.project.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }
}
