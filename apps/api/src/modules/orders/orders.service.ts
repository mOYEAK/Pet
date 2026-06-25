import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, OrderStatus, Prisma } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderFromBookingDto, ListOrdersQueryDto, PayOrderDto } from "./dto";

const PAY_METHOD_TEXT: Record<string, string> = {
  STORE_PAY: "到店支付",
  MEMBER_BALANCE: "会员余额",
  MOCK_PAY: "模拟支付"
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListOrdersQueryDto) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId: query.userId,
        status: query.status as OrderStatus | undefined
      },
      include: {
        user: true,
        booking: {
          include: {
            pet: true,
            service: true
          }
        },
        consumptionRecords: true
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(orders);
  }

  async getById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        booking: {
          include: {
            pet: true,
            service: true
          }
        },
        consumptionRecords: true
      }
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

    const paidAmount = new Prisma.Decimal(input.paidAmount ?? order.totalAmount.toNumber());

    if (paidAmount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("实收金额必须大于 0");
    }

    const paidOrder = await this.prisma.$transaction(async (tx) => {
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

      await tx.booking.update({
        where: { id: order.bookingId },
        data: { status: BookingStatus.COMPLETED }
      });

      await tx.consumptionRecord.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          amount: paidAmount,
          type: input.payMethod === "MEMBER_BALANCE" ? "MEMBER_BALANCE_PAYMENT" : "ORDER_PAYMENT",
          description: `${PAY_METHOD_TEXT[input.payMethod]}：${order.booking.service.name}`
        }
      });

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paidAmount,
          payMethod: input.payMethod,
          status: OrderStatus.PAID
        },
        include: this.orderInclude()
      });

      return updatedOrder;
    });

    return serializeEntity(paidOrder);
  }

  private orderInclude() {
    return {
      user: true,
      booking: {
        include: {
          pet: true,
          service: true
        }
      },
      consumptionRecords: true
    } satisfies Prisma.OrderInclude;
  }
}
