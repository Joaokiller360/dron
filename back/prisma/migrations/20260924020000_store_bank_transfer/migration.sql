-- Bank transfer as a second payment method
CREATE TYPE "PaymentMethod" AS ENUM ('PAYPAL', 'TRANSFER');

ALTER TABLE "orders"
  ADD COLUMN "payment_method" "PaymentMethod" NOT NULL DEFAULT 'PAYPAL',
  ADD COLUMN "transfer_bank" TEXT,
  ADD COLUMN "transfer_reference" TEXT;

CREATE INDEX "orders_transfer_reference_idx" ON "orders"("transfer_reference");
