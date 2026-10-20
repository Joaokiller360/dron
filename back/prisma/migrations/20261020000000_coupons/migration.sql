-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "coupon_code" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "coupon_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "promotions_coupon_code_key" ON "promotions"("coupon_code");
