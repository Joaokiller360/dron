-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paid_whatsapp_at" TIMESTAMP(3),
ADD COLUMN     "shipped_whatsapp_at" TIMESTAMP(3);

-- Orders paid or shipped before WhatsApp notices existed are not messaged now
UPDATE "orders" SET "paid_whatsapp_at" = "paid_at" WHERE "paid_at" IS NOT NULL;
UPDATE "orders" SET "shipped_whatsapp_at" = "shipped_at" WHERE "shipped_at" IS NOT NULL;
