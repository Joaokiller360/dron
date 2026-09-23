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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrderStatus } from '@prisma/client';
import { StoreService } from './store.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('store')
@Controller('orders')
export class OrdersController {
  constructor(private readonly store: StoreService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: place an order from the store cart' })
  create(@Body() dto: CreateOrderDto) {
    return this.store.createOrder(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiOperation({ summary: 'Admin: list orders, newest first' })
  findAll(@Query('status') status?: OrderStatus) {
    return this.store.findAllOrders(status);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: move an order through pending/confirmed/completed/cancelled' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.store.updateOrderStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete an order' })
  remove(@Param('id') id: string) {
    return this.store.removeOrder(id);
  }
}
