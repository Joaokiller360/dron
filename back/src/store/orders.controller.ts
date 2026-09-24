import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { OrderStatus } from '@prisma/client';
import { OrdersService, WebhookEvent } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateTransferOrderDto } from './dto/create-transfer-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { PaypalOrderDto } from './dto/paypal-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('store')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: reserve the cart and open a PayPal order' })
  checkout(@Body() dto: CreateOrderDto) {
    return this.orders.checkout(dto);
  }

  @Post('transfer')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Public: order paid by bank transfer (transfer code checked by the owner)',
  })
  checkoutTransfer(@Body() dto: CreateTransferOrderDto) {
    return this.orders.checkoutTransfer(dto);
  }

  @Post('paypal/capture')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: capture an approved PayPal order and verify the payment' })
  capture(@Body() dto: PaypalOrderDto) {
    return this.orders.capture(dto.paypalOrderId);
  }

  @Post('paypal/cancel')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: buyer left PayPal without paying; release the reserved units' })
  cancel(@Body() dto: PaypalOrderDto) {
    return this.orders.cancelCheckout(dto.paypalOrderId);
  }

  @Post('paypal/webhook')
  @HttpCode(200)
  @SkipThrottle()
  @ApiOperation({ summary: 'PayPal webhook (signature verified with PayPal before use)' })
  webhook(@Headers() headers: Record<string, string>, @Body() event: WebhookEvent) {
    return this.orders.handleWebhook(headers, event);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiOperation({ summary: 'Admin: list orders, newest first' })
  findAll(@Query('status') status?: OrderStatus) {
    return this.orders.findAll(status);
  }

  @Patch(':id/ship')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: set carrier and tracking number; emails the buyer' })
  ship(@Param('id') id: string, @Body() dto: ShipOrderDto) {
    return this.orders.ship(id, dto);
  }

  @Post(':id/confirm-transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: the transfer arrived; mark the order paid and email the buyer' })
  confirmTransfer(@Param('id') id: string) {
    return this.orders.confirmTransfer(id);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: refund the whole PayPal payment' })
  refund(@Param('id') id: string) {
    return this.orders.refund(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: mark delivered, or cancel an unpaid checkout' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete an unpaid or cancelled order' })
  remove(@Param('id') id: string) {
    return this.orders.remove(id);
  }
}
