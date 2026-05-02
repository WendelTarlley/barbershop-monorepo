ALTER TABLE "client" RENAME TO "customer";

ALTER TABLE "appointment" RENAME COLUMN "client_id" TO "customer_id";

ALTER TABLE "customer"
  ADD COLUMN "password_hash" TEXT,
  ADD COLUMN "first_access" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");
