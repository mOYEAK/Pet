import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, Prisma } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto, ListBookingsQueryDto } from "./dto";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new NotFoundException("Booking not found");
    }

    return serializeEntity(booking);
  }

  async create(input: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({ where: { id: input.serviceId } });

    if (!service || !service.enabled) {
      throw new BadRequestException("Service is unavailable");
    }

    const pet = await this.prisma.pet.findUnique({ where: { id: input.petId } });

    if (!pet || pet.userId !== input.userId) {
      throw new BadRequestException("Pet does not belong to the user");
    }

    const bookingDate = this.parseDateOnly(input.bookingDate);
    const startTime = this.parseDateTime(input.bookingDate, input.startTime);
    const endTime = input.endTime
      ? this.parseDateTime(input.bookingDate, input.endTime)
      : new Date(startTime.getTime() + service.durationMinutes * 60_000);

    if (endTime <= startTime) {
      throw new BadRequestException("Booking end time must be after start time");
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

    return serializeEntity(booking);
  }

  async updateStatus(id: string, status: BookingStatus) {
    await this.ensureExists(id);

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
      throw new BadRequestException("Booking time slot is already occupied");
    }
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.booking.count({ where: { id } });

    if (count === 0) {
      throw new NotFoundException("Booking not found");
    }
  }

  private parseDateOnly(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException("Date must use YYYY-MM-DD format");
    }

    return new Date(`${date}T00:00:00.000Z`);
  }

  private parseDateTime(date: string, time: string) {
    const value = /^\d{2}:\d{2}$/.test(time) ? `${date}T${time}:00.000Z` : time;
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("Time is invalid");
    }

    return parsed;
  }
}
