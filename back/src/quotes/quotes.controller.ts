import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { clientIp } from '../common/client-ip';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { SendQuoteEmailDto } from './dto/send-quote-email.dto';
import { AcceptQuoteDto } from './dto/accept-quote.dto';
import { RejectQuoteDto } from './dto/reject-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Get('public/:token')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: a proforma by its secret link token' })
  findPublic(@Param('token') token: string) {
    return this.quotes.findPublic(token);
  }

  @Post('public/:token/accept')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: the client accepts the proforma and its terms' })
  accept(@Param('token') token: string, @Body() dto: AcceptQuoteDto, @Req() req: Request) {
    return this.quotes.accept(token, dto, clientIp(req));
  }

  @Post('public/:token/reject')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: the client rejects the proforma (optional reason)' })
  reject(@Param('token') token: string, @Body() dto: RejectQuoteDto) {
    return this.quotes.reject(token, dto);
  }

  @Post('public/:token/view')
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: page opened in a browser (the first time emails the shop)' })
  markViewed(@Param('token') token: string) {
    return this.quotes.markViewed(token);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: all proformas, newest first' })
  findAll() {
    return this.quotes.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create a proforma' })
  create(@Body() dto: CreateQuoteDto) {
    return this.quotes.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update a proforma (totals are recomputed)' })
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotes.update(id, dto);
  }

  @Post(':id/email')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Admin: email the proforma to the client' })
  sendEmail(@Param('id') id: string, @Body() dto: SendQuoteEmailDto) {
    return this.quotes.sendEmail(id, dto);
  }

  @Post(':id/token')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: new public link; the previous one stops working' })
  regenerateToken(@Param('id') id: string) {
    return this.quotes.regenerateToken(id);
  }

  @Post(':id/whatsapp')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: record that the proforma was sent by WhatsApp' })
  markWhatsapp(@Param('id') id: string) {
    return this.quotes.markWhatsapp(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete a proforma' })
  remove(@Param('id') id: string) {
    return this.quotes.remove(id);
  }
}
