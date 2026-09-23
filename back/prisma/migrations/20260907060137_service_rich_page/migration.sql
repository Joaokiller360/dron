-- AlterTable
ALTER TABLE "services" ADD COLUMN     "is_page" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "meta_description" TEXT,
ADD COLUMN     "meta_title" TEXT,
ADD COLUMN     "page" JSONB;
