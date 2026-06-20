import { Injectable } from "@nestjs/common";
import { BookingStatus, OrderStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const today = this.startOfUtcDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const [todayBookings, pendingBookings, paidOrders, newCustomers, popularServices] = await Promise.all([
      this.prisma.booking.count({
        where: {
          bookingDate: today
        }
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.PENDING
        }
      }),
      this.prisma.order.findMany({
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.COMPLETED] },
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        select: { paidAmount: true }
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      this.prisma.service.findMany({
        where: { enabled: true },
        include: {
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: {
          bookings: {
            _count: "desc"
          }
        },
        take: 5
      })
    ]);

    return {
      todayBookings,
      pendingBookings,
      todayRevenue: paidOrders.reduce((sum, order) => sum + order.paidAmount.toNumber(), 0),
      newCustomers,
      popularServices: popularServices.map((service) => ({
        id: service.id,
        name: service.name,
        bookingCount: service._count.bookings
      }))
    };
  }

  private startOfUtcDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }
}
