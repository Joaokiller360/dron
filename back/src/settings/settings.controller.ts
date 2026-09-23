import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { ContactInfoDto } from './dto/contact-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('contact')
  @ApiOperation({ summary: 'Public: contact phone and email shown on the site' })
  getContact() {
    return this.settings.getContact();
  }

  @Patch('contact')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update contact phone and email' })
  updateContact(@Body() dto: ContactInfoDto) {
    return this.settings.updateContact(dto);
  }
}
