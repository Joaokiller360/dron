-- Delivery zone picked at checkout and its shipping cost (included in total_cents)
ALTER TABLE "orders"
  ADD COLUMN "shipping_zone" TEXT,
  ADD COLUMN "shipping_cents" INTEGER NOT NULL DEFAULT 0;
