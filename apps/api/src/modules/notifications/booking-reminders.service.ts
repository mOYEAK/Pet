import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BookingStatus, NotificationType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "./notifications.service";

@Injectable()
export class BookingRemindersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BookingRemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.processDueReminders();
    } catch (error) {
      this.logger.error(`启动时预约提醒扫描失败：${this.errorMessage(error)}`);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: "booking-reminders",
    timeZone: "Asia/Shanghai",
    waitForCompletion: true
  })
  async handleScheduledReminders() {
    try {
      await this.processDueReminders();
    } catch (error) {
      this.logger.error(`预约提醒定时扫描失败：${this.errorMessage(error)}`);
    }
  }

  async processDueReminders(now = new Date()) {
    if (!this.isEnabled()) {
      return { processed: 0 };
    }

    const reminderDeadline = new Date(now.getTime() + this.reminderHours() * 60 * 60 * 1000);
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        reminderSentAt: null,
        startTime: { gt: now, lte: reminderDeadline }
      },
      include: {
        pet: { select: { name: true } },
        service: { select: { name: true } }
      },
      orderBy: { startTime: "asc" },
      take: 100
    });

    let processed = 0;
    for (const booking of bookings) {
      try {
        const sent = await this.prisma.$transaction(async (tx) => {
          const claimed = await tx.booking.updateMany({
            where: {
              id: booking.id,
              status: BookingStatus.CONFIRMED,
              reminderSentAt: null,
              startTime: { gt: now, lte: reminderDeadline }
            },
            data: { reminderSentAt: now }
          });

          if (claimed.count === 0) {
            return false;
          }

          await this.notificationsService.create(
            {
              userId: booking.userId,
              title: "预约到店提醒",
              content: `您预约的${booking.service.name}将于${this.formatStartTime(booking.startTime)}开始，服务宠物：${booking.pet.name}。请提前 10 分钟到店，如需改期请联系门店。`,
              type: NotificationType.BOOKING_REMINDER,
              relatedType: "booking",
              relatedId: booking.id
            },
            tx
          );

          return true;
        });

        if (sent) {
          processed += 1;
        }
      } catch (error) {
        this.logger.warn(`预约 ${booking.id} 提醒发送失败：${this.errorMessage(error)}`);
      }
    }

    if (processed > 0) {
      this.logger.log(`已生成 ${processed} 条预约到店提醒`);
    }

    return { processed };
  }

  private isEnabled() {
    const value = (this.config.get<string>("BOOKING_REMINDER_ENABLED") ?? "true").toLowerCase();
    return !["0", "false", "no"].includes(value);
  }

  private reminderHours() {
    const configured = Number(this.config.get<string>("BOOKING_REMINDER_HOURS") ?? "24");
    return Number.isFinite(configured) ? Math.min(Math.max(configured, 1), 168) : 24;
  }

  private formatStartTime(value: Date) {
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(value);
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "未知错误";
  }
}
