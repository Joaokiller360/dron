-- Product page details (material…) and options that change the price (size, color…)
ALTER TABLE "products"
  ADD COLUMN "specs" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "options" JSONB NOT NULL DEFAULT '[]';
