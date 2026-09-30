import { Get } from '@nestjs/common';
import { InternalController } from '@app/common/internal/internal.guard';
import { PromotionsService } from '../promotions/promotions.service';
import { SettingsService } from '../settings/settings.service';

/** What the store service reads from content */
@InternalController('content')
export class ContentInternalController {
  constructor(
    private readonly promotions: PromotionsService,
    private readonly settings: SettingsService,
  ) {}

  /** Discounts running now, applied to catalog prices and at checkout */
  @Get('store-discounts')
  storeDiscounts() {
    return this.promotions.activeStoreDiscounts();
  }

  /** Shop email/phone, used as sender reply-to and for owner notices */
  @Get('contact')
  contact() {
    return this.settings.getContact();
  }
}
