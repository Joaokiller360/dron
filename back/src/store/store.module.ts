import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { StoreController } from './store.controller';
import { ProductsController } from './products.controller';
import { OrdersController } from './orders.controller';
import { StoreService } from './store.service';

@Module({
  imports: [SettingsModule],
  controllers: [StoreController, ProductsController, OrdersController],
  providers: [StoreService],
})
export class StoreModule {}
