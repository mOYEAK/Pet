import { Injectable } from "@nestjs/common";
import { BookingStatus, OrderStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type StatsPeriodKey = "7d" | "30d" | "month";

const PAID_ORDER_STATUSES = [OrderStatus.PAID, OrderStatus.COMPLETED];
const MEMBER_PAY_METHODS = ["MEMBER_BALANCE", "PACKAGE_CARD"];
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(period: StatsPeriodKey) {
    const range = this.resolvePeriod(period);
    const { startAt, endAt, bookingStart, bookingEnd } = this.resolveRangeDates(range.startDate, range.endDate);

    const [orders, bookings, newCustomers, customers] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: { in: PAID_ORDER_STATUSES },
          paidAt: { gte: startAt, lt: endAt }
        },
        select: {
          userId: true,
          paidAmount: true,
          payMethod: true,
          paidAt: true,
          booking: {
            select: {
              service: { select: { id: true, name: true } }
            }
          }
        }
      }),
      this.prisma.booking.findMany({
        where: {
          status: { not: BookingStatus.CANCELLED },
          bookingDate: { gte: bookingStart, lt: bookingEnd }
        },
        select: {
          bookingDate: true,
          service: { select: { id: true, name: true } }
        }
      }),
      this.prisma.user.findMany({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: { gte: startAt, lt: endAt }
        },
        select: { createdAt: true }
      }),
      this.prisma.user.findMany({
        where: { role: UserRole.CUSTOMER },
        select: {
          createdAt: true,
          orders: {
            where: {
              status: { in: PAID_ORDER_STATUSES },
              paidAt: { not: null }
            },
            orderBy: { paidAt: "desc" },
            take: 1,
            select: { paidAt: true }
          }
        }
      })
    ]);

    const daily = new Map(
      this.dateKeys(range.startDate, range.endDate).map((date) => [
        date,
        { date, revenue: 0, bookingCount: 0, newCustomerCount: 0 }
      ])
    );
    const paymentCounts = new Map<string, number>();
    const serviceStats = new Map<string, { id: string; name: string; bookingCount: number; revenue: number }>();

    for (const order of orders) {
      paymentCounts.set(order.userId, (paymentCounts.get(order.userId) ?? 0) + 1);
      const isCashRevenue = order.payMethod !== "PACKAGE_CARD";
      const amount = order.paidAmount.toNumber();
      const dateKey = order.paidAt ? this.shanghaiDateKey(order.paidAt) : null;

      if (dateKey && isCashRevenue) {
        const day = daily.get(dateKey);
        if (day) day.revenue += amount;
      }

      const service = order.booking.service;
      const serviceRow = serviceStats.get(service.id) ?? {
        id: service.id,
        name: service.name,
        bookingCount: 0,
        revenue: 0
      };
      if (isCashRevenue) serviceRow.revenue += amount;
      serviceStats.set(service.id, serviceRow);
    }

    for (const booking of bookings) {
      const dateKey = booking.bookingDate.toISOString().slice(0, 10);
      const day = daily.get(dateKey);
      if (day) day.bookingCount += 1;

      const serviceRow = serviceStats.get(booking.service.id) ?? {
        id: booking.service.id,
        name: booking.service.name,
        bookingCount: 0,
        revenue: 0
      };
      serviceRow.bookingCount += 1;
      serviceStats.set(booking.service.id, serviceRow);
    }

    for (const customer of newCustomers) {
      const day = daily.get(this.shanghaiDateKey(customer.createdAt));
      if (day) day.newCustomerCount += 1;
    }

    const payingCustomerCount = paymentCounts.size;
    const repeatCustomerCount = [...paymentCounts.values()].filter((count) => count >= 2).length;
    const inactiveCutoff = this.shanghaiStartAt(this.addDays(this.shanghaiDateKey(new Date()), -60));
    const inactiveCustomerCount = customers.filter((customer) => {
      const latestPaidAt = customer.orders[0]?.paidAt;
      return latestPaidAt ? latestPaidAt < inactiveCutoff : customer.createdAt < inactiveCutoff;
    }).length;
    const revenue = orders
      .filter((order) => order.payMethod !== "PACKAGE_CARD")
      .reduce((sum, order) => sum + order.paidAmount.toNumber(), 0);
    const memberConsumption = orders
      .filter((order) => order.payMethod && MEMBER_PAY_METHODS.includes(order.payMethod))
      .reduce((sum, order) => sum + order.paidAmount.toNumber(), 0);

    return {
      period: range,
      summary: {
        revenue: this.roundMoney(revenue),
        bookingCount: bookings.length,
        payingCustomerCount,
        repeatCustomerCount,
        repeatRate: payingCustomerCount === 0 ? 0 : Number(((repeatCustomerCount / payingCustomerCount) * 100).toFixed(1)),
        memberConsumption: this.roundMoney(memberConsumption),
        newCustomerCount: newCustomers.length,
        inactiveCustomerCount
      },
      trend: [...daily.values()].map((item) => ({ ...item, revenue: this.roundMoney(item.revenue) })),
      popularServices: [...serviceStats.values()]
        .map((item) => ({ ...item, revenue: this.roundMoney(item.revenue) }))
        .filter((item) => item.bookingCount > 0 || item.revenue > 0)
        .sort((a, b) => b.bookingCount - a.bookingCount || b.revenue - a.revenue)
        .slice(0, 5)
    };
  }

  async dashboard() {
    const todayKey = this.shanghaiDateKey(new Date());
    const tomorrowKey = this.addDays(todayKey, 1);
    const todayStart = this.shanghaiStartAt(todayKey);
    const tomorrowStart = this.shanghaiStartAt(tomorrowKey);
    const todayDate = this.dateOnly(todayKey);
    const [week, month, todayBookings, pendingBookings, todayOrders, newCustomers, recentOrders] = await Promise.all([
      this.overview("7d"),
      this.overview("month"),
      this.prisma.booking.count({
        where: { bookingDate: todayDate, status: { not: BookingStatus.CANCELLED } }
      }),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.order.findMany({
        where: {
          status: { in: PAID_ORDER_STATUSES },
          paidAt: { gte: todayStart, lt: tomorrowStart },
          payMethod: { not: "PACKAGE_CARD" }
        },
        select: { paidAmount: true }
      }),
      this.prisma.user.count({
        where: { role: UserRole.CUSTOMER, createdAt: { gte: todayStart, lt: tomorrowStart } }
      }),
      this.prisma.order.findMany({
        where: { status: { in: PAID_ORDER_STATUSES }, paidAt: { not: null } },
        orderBy: { paidAt: "desc" },
        take: 5,
        select: {
          id: true,
          paidAmount: true,
          payMethod: true,
          status: true,
          paidAt: true,
          user: { select: { nickname: true, phone: true } },
          booking: {
            select: {
              pet: { select: { name: true } },
              service: { select: { name: true } }
            }
          }
        }
      })
    ]);

    return {
      todayBookings,
      pendingBookings,
      todayRevenue: this.roundMoney(todayOrders.reduce((sum, order) => sum + order.paidAmount.toNumber(), 0)),
      newCustomers,
      monthRevenue: month.summary.revenue,
      monthBookings: month.summary.bookingCount,
      weekTrend: week.trend,
      popularServices: month.popularServices,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customerName: order.user.nickname ?? order.user.phone ?? "未命名客户",
        petName: order.booking.pet.name,
        serviceName: order.booking.service.name,
        paidAmount: order.paidAmount.toNumber(),
        payMethod: order.payMethod,
        status: order.status,
        paidAt: order.paidAt?.toISOString() ?? null
      }))
    };
  }

  async businessData() {
    const todayKey = this.shanghaiDateKey(new Date());
    const tomorrowKey = this.addDays(todayKey, 1);
    const todayStart = this.shanghaiStartAt(todayKey);
    const tomorrowStart = this.shanghaiStartAt(tomorrowKey);
    const [month, todayBookings, pendingBookings, todayOrders, customers] = await Promise.all([
      this.overview("month"),
      this.prisma.booking.count({
        where: { bookingDate: this.dateOnly(todayKey), status: { not: BookingStatus.CANCELLED } }
      }),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.order.findMany({
        where: {
          status: { in: PAID_ORDER_STATUSES },
          paidAt: { gte: todayStart, lt: tomorrowStart },
          payMethod: { not: "PACKAGE_CARD" }
        },
        select: { paidAmount: true }
      }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } })
    ]);

    return {
      todayRevenue: this.roundMoney(todayOrders.reduce((sum, order) => sum + order.paidAmount.toNumber(), 0)),
      monthRevenue: month.summary.revenue,
      todayBookings,
      monthBookings: month.summary.bookingCount,
      pendingBookings,
      customers,
      memberConsumption: month.summary.memberConsumption,
      repeatRate: month.summary.repeatRate,
      inactiveCustomerCount: month.summary.inactiveCustomerCount,
      popularServices: month.popularServices
    };
  }

  private resolvePeriod(period: StatsPeriodKey) {
    const endDate = this.shanghaiDateKey(new Date());
    const startDate =
      period === "7d" ? this.addDays(endDate, -6) : period === "30d" ? this.addDays(endDate, -29) : `${endDate.slice(0, 7)}-01`;
    return { key: period, startDate, endDate };
  }

  private resolveRangeDates(startDate: string, endDate: string) {
    const endExclusive = this.addDays(endDate, 1);
    return {
      startAt: this.shanghaiStartAt(startDate),
      endAt: this.shanghaiStartAt(endExclusive),
      bookingStart: this.dateOnly(startDate),
      bookingEnd: this.dateOnly(endExclusive)
    };
  }

  private dateKeys(startDate: string, endDate: string) {
    const dates: string[] = [];
    for (let current = startDate; current <= endDate; current = this.addDays(current, 1)) dates.push(current);
    return dates;
  }

  private addDays(dateKey: string, days: number) {
    const date = this.dateOnly(dateKey);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private shanghaiDateKey(date: Date) {
    return new Date(date.getTime() + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
  }

  private shanghaiStartAt(dateKey: string) {
    return new Date(`${dateKey}T00:00:00+08:00`);
  }

  private dateOnly(dateKey: string) {
    return new Date(`${dateKey}T00:00:00.000Z`);
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}
