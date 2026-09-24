-- Order statuses for PayPal payments and shipping (existing rows are mapped)
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED');
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus" USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'PENDING_PAYMENT'
    WHEN 'CONFIRMED' THEN 'PAID'
    ELSE "status"::text
  END
)::"OrderStatus";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
DROP TYPE "OrderStatus_old";

-- Delivery address, PayPal references and shipping details
ALTER TABLE "orders"
  ADD COLUMN "address" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "city" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "paypal_order_id" TEXT,
  ADD COLUMN "paypal_capture_id" TEXT,
  ADD COLUMN "paid_at" TIMESTAMP(3),
  ADD COLUMN "refunded_at" TIMESTAMP(3),
  ADD COLUMN "carrier" TEXT,
  ADD COLUMN "tracking_number" TEXT,
  ADD COLUMN "tracking_url" TEXT,
  ADD COLUMN "shipped_at" TIMESTAMP(3),
  ADD COLUMN "paid_email_at" TIMESTAMP(3),
  ADD COLUMN "shipped_email_at" TIMESTAMP(3);
ALTER TABLE "orders" ALTER COLUMN "address" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "city" DROP DEFAULT;

CREATE UNIQUE INDEX "orders_paypal_order_id_key" ON "orders"("paypal_order_id");
CREATE UNIQUE INDEX "orders_paypal_capture_id_key" ON "orders"("paypal_capture_id");
