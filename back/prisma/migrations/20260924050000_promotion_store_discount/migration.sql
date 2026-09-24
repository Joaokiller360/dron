-- Promotions can discount store products (all, or the listed ones)
ALTER TABLE "promotions"
  ADD COLUMN "discount_type" TEXT,
  ADD COLUMN "discount_value" INTEGER,
  ADD COLUMN "product_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
