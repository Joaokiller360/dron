import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { StoreSettingsDto } from './dto/store-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly store: StoreService) {}

  @Get()
  @ApiOperation({ summary: 'Public: store switches and published products' })
  findPublic() {
    return this.store.findPublic();
  }

  @Get('status')
  @ApiOperation({ summary: 'Public: whether the store is visible and selling (for the site menu)' })
  async status() {
    const { enabled, sales } = await this.store.getSettings();
    return { enabled, sales };
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: whether PayPal is configured (sandbox/live, webhook)' })
  payments() {
    return this.store.paymentStatus();
  }

  @Get('payments/check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: test the PayPal credentials against PayPal' })
  checkPayments() {
    return this.store.checkPayments();
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: read store switches' })
  getSettings() {
    return this.store.getSettings();
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: turn the store / sales on or off' })
  updateSettings(@Body() dto: StoreSettingsDto) {
    return this.store.updateSettings(dto);
  }
}
