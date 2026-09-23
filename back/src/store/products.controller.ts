import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('store')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly store: StoreService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Admin: all products, published or not' })
  findAll() {
    return this.store.findAllProducts();
  }

  @Post()
  @ApiOperation({ summary: 'Admin: create a product' })
  create(@Body() dto: CreateProductDto) {
    return this.store.createProduct(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin: update a product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.store.updateProduct(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin: delete a product' })
  remove(@Param('id') id: string) {
    return this.store.removeProduct(id);
  }
}
