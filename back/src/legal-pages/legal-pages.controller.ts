import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LegalPagesService } from './legal-pages.service';
import { CreateLegalPageDto } from './dto/create-legal-page.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('legal-pages')
@Controller('legal-pages')
export class LegalPagesController {
  constructor(private readonly legalPagesService: LegalPagesService) {}

  @Get()
  @ApiOperation({ summary: 'Public: list published legal pages' })
  findPublished() {
    return this.legalPagesService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all legal pages, published or not' })
  findAllForAdmin() {
    return this.legalPagesService.findAllForAdmin();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Public: read one published legal page by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.legalPagesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create a legal page' })
  create(@Body() dto: CreateLegalPageDto) {
    return this.legalPagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update a legal page' })
  update(@Param('id') id: string, @Body() dto: UpdateLegalPageDto) {
    return this.legalPagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete a legal page' })
  remove(@Param('id') id: string) {
    return this.legalPagesService.remove(id);
  }
}
