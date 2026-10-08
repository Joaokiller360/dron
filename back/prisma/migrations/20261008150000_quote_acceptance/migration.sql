-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "accepted_at" TIMESTAMP(3),
ADD COLUMN     "accepted_ip" TEXT,
ADD COLUMN     "accepted_name" TEXT;
