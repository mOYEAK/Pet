ALTER TYPE "NotificationType" ADD VALUE 'BOOKING_REMINDER';

ALTER TABLE "bookings" ADD COLUMN "reminder_sent_at" TIMESTAMP(3);

CREATE INDEX "bookings_status_start_time_reminder_sent_at_idx"
ON "bookings"("status", "start_time", "reminder_sent_at");
