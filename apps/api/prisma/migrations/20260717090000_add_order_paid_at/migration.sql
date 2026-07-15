ALTER TABLE "orders" ADD COLUMN "paid_at" TIMESTAMP(3);

UPDATE "orders"
SET "paid_at" = COALESCE(
  (
    SELECT MIN("consumption_records"."created_at")
    FROM "consumption_records"
    WHERE "consumption_records"."order_id" = "orders"."id"
  ),
  "orders"."updated_at",
  "orders"."created_at"
)
WHERE "orders"."status" IN ('PAID', 'COMPLETED');

CREATE INDEX "orders_status_paid_at_idx" ON "orders"("status", "paid_at");
