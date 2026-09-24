import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiOperation({ summary: 'Public: list published services' })
  findPublished(@Query('categoryId', new ParseUUIDPipe({ optional: true })) categoryId?: string) {
    return this.servicesService.findPublished(categoryId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiOperation({ summary: 'Admin: list all services, published or not' })
  findAllForAdmin(@Query('categoryId', new ParseUUIDPipe({ optional: true })) categoryId?: string) {
    return this.servicesService.findAllForAdmin(categoryId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Public: read one published service by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create a service' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update a service' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete a service' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
