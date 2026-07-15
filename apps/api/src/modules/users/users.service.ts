import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { serializeEntity } from "../../common/serialize";
import { PrismaService } from "../prisma/prisma.service";
import { ListUsersQueryDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListUsersQueryDto) {
    const users = await this.prisma.user.findMany({
      where: { role: query.role as UserRole | undefined },
      include: {
        pets: true,
        membership: true,
        packageCards: {
          include: { service: true }
        },
        userCoupons: {
          include: { template: true }
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return serializeEntity(users);
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        pets: true,
        bookings: {
          include: {
            pet: true,
            service: true,
            order: true
          },
          orderBy: { startTime: "desc" }
        },
        orders: {
          include: {
            coupon: {
              include: { template: true }
            },
            booking: {
              include: {
                pet: true,
                service: true
              }
            },
            consumptionRecords: true
          },
          orderBy: { createdAt: "desc" }
        },
        membership: true,
        packageCards: {
          include: {
            service: true
          },
          orderBy: { createdAt: "desc" }
        },
        userCoupons: {
          include: {
            template: true,
            usedOrder: true
          },
          orderBy: { createdAt: "desc" }
        },
        consumptionRecords: {
          orderBy: { createdAt: "desc" }
        },
        rechargeRecords: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 8
        }
      }
    });

    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    return serializeEntity(user);
  }
}
