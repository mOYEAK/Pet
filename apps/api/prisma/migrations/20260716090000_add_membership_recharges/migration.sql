CREATE TYPE "RechargePayMethod" AS ENUM ('CASH', 'WECHAT', 'ALIPAY', 'MOCK_PAY');

ALTER TYPE "NotificationType" ADD VALUE 'MEMBERSHIP_RECHARGED';
ALTER TYPE "NotificationType" ADD VALUE 'PACKAGE_CARD_ISSUED';

CREATE TABLE "recharge_records" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "paid_amount" DECIMAL(10,2) NOT NULL,
  "bonus_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "credited_amount" DECIMAL(10,2) NOT NULL,
  "balance_before" DECIMAL(10,2) NOT NULL,
  "balance_after" DECIMAL(10,2) NOT NULL,
  "pay_method" "RechargePayMethod" NOT NULL,
  "remark" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recharge_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recharge_records_user_id_created_at_idx"
ON "recharge_records"("user_id", "created_at");

CREATE INDEX "recharge_records_pay_method_created_at_idx"
ON "recharge_records"("pay_method", "created_at");

ALTER TABLE "recharge_records"
ADD CONSTRAINT "recharge_records_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
