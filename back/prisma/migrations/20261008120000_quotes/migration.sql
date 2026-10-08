-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_company" TEXT,
    "client_tax_id" TEXT,
    "client_email" TEXT,
    "client_phone" TEXT,
    "items" JSONB NOT NULL,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "tax_percent" INTEGER NOT NULL DEFAULT 0,
    "subtotal_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "notes" TEXT,
    "valid_until" TIMESTAMP(3),
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "emailed_at" TIMESTAMP(3),
    "whatsapp_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotes_number_key" ON "quotes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_token_key" ON "quotes"("token");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");
