-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "invoice_address" TEXT,
ADD COLUMN     "invoice_email" TEXT,
ADD COLUMN     "invoice_name" TEXT,
ADD COLUMN     "invoice_requested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invoice_tax_id" TEXT,
ADD COLUMN     "reject_reason" TEXT,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "viewed_at" TIMESTAMP(3);

