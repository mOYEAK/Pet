import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, NotificationType, Prisma } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto, ListBookingsQueryDto } from "./dto";

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async list(query: ListBookingsQueryDto) {
    const where: Prisma.BookingWhereInput = {
      userId: query.userId,
      status: query.status as BookingStatus | undefined,
      bookingDate: query.date ? this.parseDateOnly(query.date) : undefined
    };

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        user: true,
        pet: true,
        service: true,
        order: true
      },
      orderBy: [{ bookingDate: "asc" }, { startTime: "asc" }]
    });

    return serializeEntity(bookings);
  }

  async getById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        pet: true,
        service: true,
        order: true
      }
    });

    if (!booking) {
      throw new NotFoundException("预约不存在");
    }

    return serializeEntity(booking);
  }

  async create(input: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({ where: { id: input.serviceId } });

    if (!service || !service.enabled) {
      throw new BadRequestException("服务项目不可用");
    }

    const pet = await this.prisma.pet.findUnique({ where: { id: input.petId } });

    if (!pet || pet.userId !== input.userId) {
      throw new BadRequestException("宠物不属于该用户");
    }

    const bookingDate = this.parseDateOnly(input.bookingDate);
    const startTime = this.parseDateTime(input.bookingDate, input.startTime);
    const endTime = input.endTime
      ? this.parseDateTime(input.bookingDate, input.endTime)
      : new Date(startTime.getTime() + service.durationMinutes * 60_000);

    if (endTime <= startTime) {
      throw new BadRequestException("预约结束时间必须晚于开始时间");
    }

    const status = (input.status ?? BookingStatus.PENDING) as BookingStatus;

    if (status !== BookingStatus.CANCELLED) {
      await this.assertNoTimeConflict(startTime, endTime);
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId: input.userId,
        petId: input.petId,
        serviceId: input.serviceId,
        bookingDate,
        startTime,
        endTime,
        status,
        remark: input.remark
      },
      include: {
        user: true,
        pet: true,
        service: true,
        order: true
      }
    });

    await this.createNotificationSafely({
      userId: booking.userId,
      title: "预约已提交",
      content: `${booking.service.name} 预约已提交，门店确认后会更新状态。`,
      type: NotificationType.BOOKING_CREATED,
      relatedType: "booking",
      relatedId: booking.id
    });

    return serializeEntity(booking);
  }

  async updateStatus(id: string, status: BookingStatus) {
    const existing = await this.ensureExists(id);

    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        pet: true,
        service: true,
        order: true
      }
    });

    if (existing.status !== booking.status) {
      const notification = this.resolveStatusNotification(booking);
      if (notification) {
        await this.createNotificationSafely({
          userId: booking.userId,
          ...notification,
          relatedType: "booking",
          relatedId: booking.id
        });
      }
    }

    return serializeEntity(booking);
  }

  async cancel(id: string) {
    return this.updateStatus(id, BookingStatus.CANCELLED);
  }

  private async assertNoTimeConflict(startTime: Date, endTime: Date) {
    const conflict = await this.prisma.booking.findFirst({
      where: {
        status: { not: BookingStatus.CANCELLED },
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      },
      select: { id: true }
    });

    if (conflict) {
      throw new BadRequestException("该时间段已有预约");
    }
  }

  private async ensureExists(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException("预约不存在");
    }

    return booking;
  }

  private resolveStatusNotification(booking: { status: BookingStatus; service?: { name: string } }) {
    if (booking.status === BookingStatus.CONFIRMED) {
      return {
        title: "预约已确认",
        content: `${booking.service?.name ?? "服务"} 预约已确认，请按时到店。`,
        type: NotificationType.BOOKING_CONFIRMED
      };
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return {
        title: "预约已取消",
        content: `${booking.service?.name ?? "服务"} 预约已取消，如需服务可重新预约。`,
        type: NotificationType.BOOKING_CANCELLED
      };
    }

    return null;
  }

  private async createNotificationSafely(input: Parameters<NotificationsService["create"]>[0]) {
    try {
      await this.notificationsService.create(input);
    } catch (error) {
      console.warn("通知创建失败", error);
    }
  }

  private parseDateOnly(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException("日期必须使用 YYYY-MM-DD 格式");
    }

    return new Date(`${date}T00:00:00.000Z`);
  }

  private parseDateTime(date: string, time: string) {
    const value = /^\d{2}:\d{2}$/.test(time) ? this.parseShanghaiDateTime(date, time) : time;
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("时间无效");
    }

    return parsed;
  }

  private parseShanghaiDateTime(date: string, time: string) {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const utcTime = Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0);
    return new Date(utcTime).toISOString();
  }
}
