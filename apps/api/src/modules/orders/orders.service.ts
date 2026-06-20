import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { ListOrdersQueryDto } from "./dto";

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
}
