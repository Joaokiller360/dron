import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { StoreController } from './store.controller';
import { ProductsController } from './products.controller';
import { OrdersController } from './orders.controller';
import { StoreService } from './store.service';
import { OrdersService } from './orders.service';
import { PaypalService } from './paypal.service';
import { StoreMailService } from './store-mail.service';

@Module({
  imports: [SettingsModule],
  controllers: [StoreController, ProductsController, OrdersController],
  providers: [StoreService, OrdersService, PaypalService, StoreMailService],
})
export class StoreModule {}
