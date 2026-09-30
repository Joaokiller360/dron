import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { ProductsController } from './products.controller';
import { OrdersController } from './orders.controller';
import { StoreService } from './store.service';
import { OrdersService } from './orders.service';
import { PaypalService } from './paypal.service';
import { StoreMailService } from './store-mail.service';
import { ContentClient } from './content-client';
import { StoreInternalController } from './store-internal.controller';
import { ReorderProductsController } from './reorder-products.controller';

@Module({
  controllers: [
    StoreController,
    ProductsController,
    OrdersController,
    ReorderProductsController,
    StoreInternalController,
  ],
  providers: [StoreService, OrdersService, PaypalService, StoreMailService, ContentClient],
})
export class StoreModule {}
