-- Service.category is now optional (full service pages have no category)
ALTER TABLE "services" ALTER COLUMN "category_id" DROP NOT NULL;
