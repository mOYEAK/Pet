import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BookingRemindersService } from "./booking-reminders.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, BookingRemindersService],
  exports: [NotificationsService, BookingRemindersService]
})
export class NotificationsModule {}
