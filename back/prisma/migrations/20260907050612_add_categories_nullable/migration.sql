-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('PROJECT', 'CLIENT', 'SERVICE');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "category_id" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "category_id" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "category_id" TEXT;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_type_slug_key" ON "categories"("type", "slug");

-- CreateIndex
CREATE INDEX "clients_category_id_idx" ON "clients"("category_id");

-- CreateIndex
CREATE INDEX "projects_category_id_idx" ON "projects"("category_id");

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "services"("category_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
