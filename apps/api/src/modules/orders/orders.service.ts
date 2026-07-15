import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, NotificationType, OrderStatus, PackageCardStatus, Prisma, UserCouponStatus } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderFromBookingDto, ListOrdersQueryDto, PayOrderDto } from "./dto";

const PAY_METHOD_TEXT: Record<string, string> = {
  STORE_PAY: "到店支付",
  MEMBER_BALANCE: "会员余额",
  PACKAGE_CARD: "套餐卡",
  MOCK_PAY: "模拟支付"
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async list(query: ListOrdersQueryDto) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId: query.userId,
        status: query.status as OrderStatus | undefined
      },
      include: this.orderInclude(),
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(orders);
  }

  async getById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude()
    });

    if (!order) {
      throw new NotFoundException("订单不存在");
    }

    return serializeEntity(order);
  }

  async createFromBooking(input: CreateOrderFromBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        service: true,
        order: {
          include: this.orderInclude()
        }
      }
    });

    if (!booking) {
      throw new NotFoundException("预约不存在");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException("已取消的预约不能生成订单");
    }

    if (booking.order) {
      return serializeEntity(booking.order);
    }

    const order = await this.prisma.order.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId,
        totalAmount: booking.service.basePrice,
        paidAmount: new Prisma.Decimal(0),
        status: OrderStatus.PENDING_PAYMENT
      },
      include: this.orderInclude()
    });

    return serializeEntity(order);
  }

  async pay(id: string, input: PayOrderDto) {
    if (!PAY_METHOD_TEXT[input.payMethod]) {
      throw new BadRequestException("支付方式不支持");
    }

    if (input.payMethod === "PACKAGE_CARD" && input.couponId) {
      throw new BadRequestException("套餐卡核销不能叠加优惠券");
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            service: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException("订单不存在");
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException("该订单状态不能支付");
    }

    const coupon = input.couponId
      ? await this.prisma.userCoupon.findUnique({
          where: { id: input.couponId },
          include: { template: true }
        })
      : null;

    if (input.couponId && !coupon) {
      throw new BadRequestException("优惠券不存在");
    }

    const discountAmount = coupon ? this.resolveCouponDiscount(order, coupon) : new Prisma.Decimal(0);
    const payableBeforeFloor = order.totalAmount.minus(discountAmount);
    const payableAmount = payableBeforeFloor.lessThan(0) ? new Prisma.Decimal(0) : payableBeforeFloor;
    const paidAmount =
      input.payMethod === "PACKAGE_CARD"
        ? order.totalAmount
        : coupon
          ? payableAmount
          : new Prisma.Decimal(input.paidAmount ?? payableAmount.toNumber());

    if (paidAmount.lessThan(0)) {
      throw new BadRequestException("实收金额不能小于 0");
    }

    if (!coupon && paidAmount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("实收金额必须大于 0");
    }

    const paidOrder = await this.prisma.$transaction(async (tx) => {
      const paidAt = new Date();

      if (input.payMethod === "MEMBER_BALANCE") {
        const membership = await tx.membership.findUnique({ where: { userId: order.userId } });

        if (!membership) {
          throw new BadRequestException("会员信息不存在，无法使用会员余额支付");
        }

        if (membership.balance.lessThan(paidAmount)) {
          throw new BadRequestException("会员余额不足");
        }

        await tx.membership.update({
          where: { userId: order.userId },
          data: {
            balance: { decrement: paidAmount },
            points: { increment: Math.floor(paidAmount.toNumber()) }
          }
        });
      }

      if (input.payMethod === "PACKAGE_CARD") {
        const packageCard = await tx.packageCard.findFirst({
          where: input.packageCardId
            ? { id: input.packageCardId, userId: order.userId }
            : {
                userId: order.userId,
                serviceId: order.booking.serviceId,
                status: PackageCardStatus.ACTIVE
              },
          orderBy: { createdAt: "asc" }
        });

        if (!packageCard || packageCard.serviceId !== order.booking.serviceId || packageCard.status !== PackageCardStatus.ACTIVE) {
          throw new BadRequestException("没有可用的套餐卡");
        }

        if (packageCard.remainingTimes <= 0) {
          throw new BadRequestException("套餐卡剩余次数不足");
        }

        if (packageCard.expireDate && packageCard.expireDate < new Date()) {
          throw new BadRequestException("套餐卡已过期");
        }

        await tx.packageCard.update({
          where: { id: packageCard.id },
          data: { remainingTimes: { decrement: 1 } }
        });
      }

      if (coupon) {
        await tx.userCoupon.update({
          where: { id: coupon.id },
          data: {
            status: UserCouponStatus.USED,
            usedAt: new Date()
          }
        });
      }

      await tx.booking.update({
        where: { id: order.bookingId },
        data: { status: BookingStatus.COMPLETED }
      });

      const discountText = discountAmount.greaterThan(0) ? `，优惠 ¥${discountAmount.toFixed(2)}` : "";

      await tx.consumptionRecord.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          amount: paidAmount,
          type:
            input.payMethod === "MEMBER_BALANCE"
              ? "MEMBER_BALANCE_PAYMENT"
              : input.payMethod === "PACKAGE_CARD"
                ? "PACKAGE_CARD_PAYMENT"
                : "ORDER_PAYMENT",
          description: `${PAY_METHOD_TEXT[input.payMethod]}：${order.booking.service.name}${discountText}`
        }
      });

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          couponId: coupon?.id,
          discountAmount,
          paidAmount,
          payMethod: input.payMethod,
          status: OrderStatus.PAID,
          paidAt
        },
        include: this.orderInclude()
      });

      return updatedOrder;
    });

    await this.createNotificationSafely({
      userId: order.userId,
      title: "订单已支付",
      content: `${order.booking.service.name} 已完成支付，实付 ¥${paidAmount.toFixed(2)}${discountAmount.greaterThan(0) ? `，优惠 ¥${discountAmount.toFixed(2)}` : ""}。`,
      type: NotificationType.ORDER_PAID,
      relatedType: "order",
      relatedId: order.id
    });

    return serializeEntity(paidOrder);
  }

  private orderInclude() {
    return {
      user: true,
      coupon: {
        include: {
          template: true
        }
      },
      booking: {
        include: {
          pet: true,
          service: true
        }
      },
      consumptionRecords: true
    } satisfies Prisma.OrderInclude;
  }

  private resolveCouponDiscount(
    order: { userId: string; totalAmount: Prisma.Decimal },
    coupon: {
      userId: string;
      status: UserCouponStatus;
      template: {
        enabled: boolean;
        startDate: Date | null;
        endDate: Date | null;
        thresholdAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
      };
    }
  ) {
    if (coupon.userId !== order.userId) {
      throw new BadRequestException("优惠券不属于当前客户");
    }

    if (coupon.status !== UserCouponStatus.UNUSED) {
      throw new BadRequestException("优惠券不可用或已核销");
    }

    if (!coupon.template.enabled) {
      throw new BadRequestException("优惠券模板已停用");
    }

    const today = this.parseDateOnly(new Date().toISOString().slice(0, 10));

    if (coupon.template.startDate && today.getTime() < coupon.template.startDate.getTime()) {
      throw new BadRequestException("优惠券尚未生效");
    }

    if (coupon.template.endDate && today.getTime() > coupon.template.endDate.getTime()) {
      throw new BadRequestException("优惠券已过期");
    }

    if (order.totalAmount.lessThan(coupon.template.thresholdAmount)) {
      throw new BadRequestException("订单金额未达到优惠券使用门槛");
    }

    return coupon.template.discountAmount.lessThan(order.totalAmount) ? coupon.template.discountAmount : order.totalAmount;
  }

  private parseDateOnly(date: string) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private async createNotificationSafely(input: Parameters<NotificationsService["create"]>[0]) {
    try {
      await this.notificationsService.create(input);
    } catch (error) {
      console.warn("通知创建失败", error);
    }
  }
}
