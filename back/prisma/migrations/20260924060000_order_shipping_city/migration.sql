-- Shipping is priced per city now (was per zone)
ALTER TABLE "orders" RENAME COLUMN "shipping_zone" TO "shipping_city";
