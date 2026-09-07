-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_category_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_category_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_category_id_fkey";

-- DropIndex
DROP INDEX "projects_category_idx";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "organization",
ALTER COLUMN "category_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "category",
ALTER COLUMN "category_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "category_id" SET NOT NULL;

-- DropEnum
DROP TYPE "ProjectCategory";

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

