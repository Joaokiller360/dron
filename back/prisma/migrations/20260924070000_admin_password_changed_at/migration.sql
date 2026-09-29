-- Changing the password signs out every session issued before it
ALTER TABLE "admin_users" ADD COLUMN "password_changed_at" TIMESTAMP(3);
