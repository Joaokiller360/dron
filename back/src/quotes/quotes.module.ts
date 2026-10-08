import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [SettingsModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
