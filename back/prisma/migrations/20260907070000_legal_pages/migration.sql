-- Realign services.category_id FK to ON DELETE SET NULL (matches the now-optional relation)
ALTER TABLE "services" DROP CONSTRAINT "services_category_id_fkey";

-- CreateTable
CREATE TABLE "legal_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_es" TEXT NOT NULL,
    "title_en" TEXT,
    "label" TEXT,
    "last_update" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" JSONB NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_pages_slug_key" ON "legal_pages"("slug");

-- CreateIndex
CREATE INDEX "legal_pages_published_idx" ON "legal_pages"("published");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
