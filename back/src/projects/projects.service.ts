import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto, include: { category: true } });
  }

  findPublished(categoryId?: string) {
    return this.prisma.project.findMany({
      where: { published: true, ...(categoryId ? { categoryId } : {}) },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  }

  findAllForAdmin(categoryId?: string) {
    return this.prisma.project.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!project) {
      throw new NotFoundException(`Project "${slug}" not found`);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureExists(id);
    return this.prisma.project.update({ where: { id }, data: dto, include: { category: true } });
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
